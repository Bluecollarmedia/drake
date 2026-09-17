import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
import { budgetAllowsScheduling,parseBulkOptions,sanitizeWorkerError } from '../server/analysis/bulk-run.mjs';
import {
 ANALYSIS_VERSION,CALIBRATION_TITLES,MODEL_PRICING,PROFILE_SCHEMA_VERSION,buildAnalysisInput,
 estimateApiCost,intelligenceSchema,requiresManualReview,stableHash,validateIntelligence,
} from '../server/analysis/song-intelligence.mjs';

const options=parseBulkOptions(process.argv.slice(2));
const evidence=JSON.parse(await readFile(new URL('../server/analysis/calibration-evidence.json',import.meta.url),'utf8'));
const secret=await readFile(new URL('../.secrets/analysis.local.json',import.meta.url),'utf8').then(text=>JSON.parse(text.replace(/^\uFEFF/,''))).catch(error=>{if(error.code==='ENOENT')return {};throw error;});
const apiKey=process.env.OPENAI_API_KEY||secret.OPENAI_API_KEY;
const model=process.env.OPENAI_ANALYSIS_MODEL||secret.OPENAI_ANALYSIS_MODEL||MODEL_PRICING.model;
const outputRoot=new URL('../artifacts/song-intelligence/',import.meta.url);
await mkdir(outputRoot,{recursive:true});
assert.equal(model,MODEL_PRICING.model,'Full-catalog cost controls are approved only for gpt-5.4-mini');

const profileSuccess=profile=>profile&&['generated','approved','needs_review'].includes(profile.review_status);
const batchBlockingError=message=>/^openai_http_(401|403|429):/.test(message)||message.includes('credit_balance_exhausted');
const usageNumbers=usage=>({
 inputTokens:Number(usage?.input_tokens??0),cachedInputTokens:Number(usage?.input_tokens_details?.cached_tokens??0),
 outputTokens:Number(usage?.output_tokens??0),reasoningTokens:Number(usage?.output_tokens_details?.reasoning_tokens??0),
});

async function eligibleSongs(db){
 return (await db.query(`select s.id,s.title,s.version_key,
  (select jsonb_agg(jsonb_build_object('name',a.name,'role',c.role) order by c.credit_order) from public.song_artists c join public.artists a on a.id=c.artist_id where c.song_id=s.id) artists,
  (select jsonb_agg(distinct jsonb_build_object('title',r.title,'date',r.release_date,'type',r.release_type)) from public.release_tracks t join public.releases r on r.id=t.release_id where t.song_id=s.id) releases,
  (select jsonb_agg(jsonb_build_object('provider',p.provider,'provider_id',p.provider_id,'url',p.url)) from public.song_provider_ids p where p.song_id=s.id) provider_links
  from public.released_catalog_eligible_songs s order by s.title,s.id`)).rows;
}
async function prepareRun(db,songs){
 const run=(await db.query(`insert into public.analysis_runs(scope,analysis_version,model,status,spending_ceiling_usd,concurrency,checkpoint_size,max_failures,request_cost_reservation_usd,settings)
  values('full_released_catalog',$1,$2,'prepared',$3,$4,$5,$6,$7,$8)
  on conflict(scope,analysis_version) do update set model=excluded.model,concurrency=excluded.concurrency,checkpoint_size=excluded.checkpoint_size,
   max_failures=excluded.max_failures,request_cost_reservation_usd=excluded.request_cost_reservation_usd,settings=excluded.settings,updated_at=now()
  returning *`,[ANALYSIS_VERSION,model,options.spendingCeilingUsd,options.concurrency,options.checkpointSize,options.maxFailures,options.requestCostReservationUsd,
   JSON.stringify({maxOutputTokens:options.maxOutputTokens,pricing:MODEL_PRICING,profileSchemaVersion:PROFILE_SCHEMA_VERSION})])).rows[0];
 await db.query(`insert into public.analysis_jobs(song_id,job_type,analysis_version,max_attempts,analysis_run_id)
  select x.id,'profile',$2,3,$3 from jsonb_to_recordset($1) x(id uuid)
  on conflict(song_id,job_type,analysis_version) do nothing`,[JSON.stringify(songs),ANALYSIS_VERSION,run.id]);
 await db.query(`update public.analysis_jobs set analysis_run_id=$2,updated_at=now() where analysis_version=$1 and job_type='profile' and status<>'completed'`,[ANALYSIS_VERSION,run.id]);
 return run;
}
async function finish(db,job,status,error=null){
 const ok=(await db.query('select public.finish_analysis_job($1,$2,$3,$4) ok',[job.id,job.lease_token,status,error])).rows[0].ok;
 if(!ok)throw new Error('job_lease_lost');
}
async function defer(db,job,error){
 const result=await db.query(`update public.analysis_jobs set status='pending',attempt_count=greatest(attempt_count-1,0),last_error=$3,
  started_at=null,completed_at=null,lease_token=null,lease_expires_at=null,updated_at=now() where id=$1 and lease_token=$2 returning id`,[job.id,job.lease_token,error]);
 if(result.rowCount!==1)throw new Error('job_lease_lost');
}
async function recordJobUsage(db,job,generated){
 const usage=usageNumbers(generated?.usage),cost=estimateApiCost(generated?.usage);
 await db.query(`update public.analysis_jobs set input_tokens=input_tokens+$3,cached_input_tokens=cached_input_tokens+$4,
  output_tokens=output_tokens+$5,reasoning_tokens=reasoning_tokens+$6,estimated_cost_usd=estimated_cost_usd+$7,
  model_snapshot=coalesce($8,model_snapshot),last_response_id=coalesce($9,last_response_id),updated_at=now()
  where id=$1 and lease_token=$2`,[job.id,job.lease_token,usage.inputTokens,usage.cachedInputTokens,usage.outputTokens,usage.reasoningTokens,cost,generated?.model??null,generated?.responseId??null]);
 return {usage,cost};
}
async function generate(input){
 if(!apiKey)throw new Error('missing_openai_api_key');
 const request={model,store:false,max_output_tokens:options.maxOutputTokens,reasoning:{effort:'none'},
  instructions:'You are the song-intelligence analyst for Which Drake?. Produce psychologically precise, situation-centered profiles. Follow evidence, distinguish material review risks from ordinary nuance, and never output copyrighted lyrics.',
  input:JSON.stringify(input),text:{format:{type:'json_schema',name:'which_drake_song_intelligence',strict:true,schema:intelligenceSchema}}};
 if(request.input.length>20000)throw new Error('analysis_input_too_large');
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(180000)});
 const body=await response.json();
 if(!response.ok)throw new Error('openai_http_'+response.status+':'+(body.error?.code||body.error?.type||'request_failed')+':'+(body.error?.message||'No message'));
 const generated={responseId:body.id,model:body.model||model,usage:body.usage||{}};
 try{
  const text=body.output_text||body.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;
  if(!text)throw new Error('openai_missing_structured_output');
  generated.profile=validateIntelligence(JSON.parse(text));return generated;
 }catch(error){error.generated=generated;throw error;}
}
async function save(db,runId,job,song,input,generated){
 const profile=generated.profile,existing=(await db.query('select * from public.song_analysis_profiles where song_id=$1 and analysis_version=$2',[song.id,ANALYSIS_VERSION])).rows[0];
 const profileId=existing?.id||randomUUID(),review=requiresManualReview(profile)?'needs_review':'generated',cost=estimateApiCost(generated.usage);
 await db.query('begin');
 await recordJobUsage(db,job,generated);
 const saved=(await db.query(`insert into public.song_analysis_profiles(id,song_id,analysis_version,schema_version,core_meaning,detailed_interpretation,central_conflict,perspective,
  primary_themes,secondary_themes,emotional_tone,emotional_intensity,emotional_dimensions,narrator_state,other_person_state,relationship,narrative,context,nuances,
  strong_fit_scenarios,moderate_fit_scenarios,negative_fit_scenarios,energy_tone,analysis_confidence,analysis_model,analyzed_at,review_status,provenance,
  analysis_input_hash,generator_response_id,generation_metadata,emotional_arc,uncertainties,analysis_run_id,quality_assessment)
  values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,now(),$26,$27,$28,$29,$30,$31,$32,$33,$34)
  on conflict(song_id,analysis_version) do update set schema_version=excluded.schema_version,core_meaning=excluded.core_meaning,detailed_interpretation=excluded.detailed_interpretation,
  central_conflict=excluded.central_conflict,perspective=excluded.perspective,primary_themes=excluded.primary_themes,secondary_themes=excluded.secondary_themes,
  emotional_tone=excluded.emotional_tone,emotional_intensity=excluded.emotional_intensity,emotional_dimensions=excluded.emotional_dimensions,narrator_state=excluded.narrator_state,
  other_person_state=excluded.other_person_state,relationship=excluded.relationship,narrative=excluded.narrative,context=excluded.context,nuances=excluded.nuances,
  strong_fit_scenarios=excluded.strong_fit_scenarios,moderate_fit_scenarios=excluded.moderate_fit_scenarios,negative_fit_scenarios=excluded.negative_fit_scenarios,
  energy_tone=excluded.energy_tone,analysis_confidence=excluded.analysis_confidence,analysis_model=excluded.analysis_model,analyzed_at=excluded.analyzed_at,
  review_status=excluded.review_status,provenance=excluded.provenance,analysis_input_hash=excluded.analysis_input_hash,generator_response_id=excluded.generator_response_id,
  generation_metadata=excluded.generation_metadata,emotional_arc=excluded.emotional_arc,uncertainties=excluded.uncertainties,analysis_run_id=excluded.analysis_run_id,
  quality_assessment=excluded.quality_assessment where not public.song_analysis_profiles.manually_edited returning id`,[
   profileId,song.id,ANALYSIS_VERSION,PROFILE_SCHEMA_VERSION,profile.coreMeaning,profile.detailedInterpretation,profile.centralConflict,profile.perspective,
   profile.themes.primary,profile.themes.secondary,profile.tone,profile.emotions.intensity,JSON.stringify(profile.dimensions),JSON.stringify(profile.narratorState),
   JSON.stringify(profile.otherPersonState),JSON.stringify(profile.relationship),JSON.stringify(profile.narrative),JSON.stringify(profile.context),profile.nuances,
   profile.strongFitScenarios.map(item=>item.text),profile.moderateFitScenarios.map(item=>item.text),profile.negativeFitScenarios.map(item=>item.text),profile.energyTone,
   profile.confidence,'openai:'+generated.model,review,JSON.stringify(input.evidence),stableHash(input),generated.responseId,
   JSON.stringify({usage:generated.usage,estimatedCostUsd:cost,pricing:MODEL_PRICING,store:false,schema:'which_drake_song_intelligence',requestedModel:model,resolvedModel:generated.model}),
   JSON.stringify({start:profile.emotions.primary[0],middle:profile.centralConflict,end:profile.emotions.direction,direction:profile.emotions.direction}),profile.uncertainties,runId,JSON.stringify(profile.qualityAssessment),
  ])).rows[0];
 if(!saved)throw new Error('manual_profile_protected');
 const source='analysis-worker:'+ANALYSIS_VERSION;
 await db.query('delete from public.song_scenarios where profile_id=$1 and source=$2',[saved.id,source]);
 const scenarios=[...profile.strongFitScenarios.map(item=>({...item,fit:'strong',variation:{}})),...profile.moderateFitScenarios.map(item=>({...item,fit:'moderate',variation:{}})),...profile.negativeFitScenarios.map(item=>({...item,fit:'negative',variation:{}})),...profile.exampleInputs.map(item=>({text:item.text,type:'matching_language',fit:'strong',variation:item.variation}))];
 for(const scenario of scenarios)await db.query(`insert into public.song_scenarios(id,song_id,profile_id,scenario_text,fit_strength,scenario_type,variation,source,review_status,scenario_key)
  values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[randomUUID(),song.id,saved.id,scenario.text,scenario.fit,scenario.type,JSON.stringify(scenario.variation),source,review,stableHash({fit:scenario.fit,type:scenario.type,text:scenario.text})]);
 for(const item of input.evidence)await db.query(`insert into public.song_analysis_sources(profile_id,song_id,source_type,source_url,source_title,publisher,evidence_notes,supports)
  values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(profile_id,source_type,source_title) do update set source_url=excluded.source_url,evidence_notes=excluded.evidence_notes,supports=excluded.supports,accessed_at=now()`,
  [saved.id,song.id,item.type,item.url||null,item.title,item.type==='curator_calibration'?'Which Drake?':'MusicBrainz',item.notes,item.supports]);
 const completed=(await db.query("select public.finish_analysis_job($1,$2,'completed',null) ok",[job.id,job.lease_token])).rows[0].ok;
 if(!completed)throw new Error('job_lease_lost');
 await db.query('commit');
 return {title:song.title,status:review,profileId:saved.id,confidence:profile.confidence,cost,usage:usageNumbers(generated.usage)};
}
async function processJob(runId,job,song){
 const db=await connectDatabase();
 let generated;
 try{
  const existing=(await db.query('select * from public.song_analysis_profiles where song_id=$1 and analysis_version=$2',[song.id,ANALYSIS_VERSION])).rows[0];
  if(profileSuccess(existing)){await finish(db,job,'completed');return {title:song.title,status:'already_complete',cost:0};}
  const input=buildAnalysisInput(song,evidence[song.title]);
  generated=await generate(input);
  return await save(db,runId,job,song,input,generated);
 }catch(error){
  await db.query('rollback').catch(()=>{});
  if(generated&&!error.generated)error.generated=generated;
  const safe=sanitizeWorkerError(error);
  if(error.generated)await recordJobUsage(db,job,error.generated);
  if(batchBlockingError(safe)){await defer(db,job,safe);return {title:song.title,status:'deferred',error:safe,cost:estimateApiCost(error.generated?.usage)};}
  await finish(db,job,'failed',safe);
  return {title:song.title,status:'failed',error:safe,cost:estimateApiCost(error.generated?.usage)};
 }finally{await db.end();}
}
async function progress(db,run,status,latest=[]){
 const counts=(await db.query(`select
  (select count(*)::int from public.released_catalog_eligible_songs) eligible,
  (select count(*)::int from public.song_analysis_profiles where analysis_version=$1 and review_status in ('generated','needs_review','approved')) completed,
  (select count(*)::int from public.released_catalog_eligible_songs e where not exists(select 1 from public.song_analysis_profiles p where p.song_id=e.id and p.analysis_version=$1 and p.review_status in ('generated','needs_review','approved'))) remaining,
  (select count(*)::int from public.analysis_jobs where analysis_version=$1 and job_type='profile' and status='failed') failed,
  (select count(*)::int from public.analysis_jobs where analysis_version=$1 and job_type='profile' and status='pending' and last_error is not null) deferred,
  (select count(*)::int from public.song_analysis_profiles where analysis_version=$1 and review_status='needs_review') needs_review`,[ANALYSIS_VERSION])).rows[0];
 const totals=(await db.query(`select coalesce(sum(input_tokens),0)::bigint input_tokens,coalesce(sum(cached_input_tokens),0)::bigint cached_input_tokens,
  coalesce(sum(output_tokens),0)::bigint output_tokens,coalesce(sum(reasoning_tokens),0)::bigint reasoning_tokens,
  coalesce(sum(estimated_cost_usd),0)::numeric estimated_cost_usd,
  coalesce(sum(greatest(attempt_count-case when status='completed' then 1 else 0 end,0)),0)::int failed_attempts
  from public.analysis_jobs where analysis_run_id=$1`,[run.id])).rows[0];
 const checkpoint={at:new Date().toISOString(),status,...counts,costUsd:Number(totals.estimated_cost_usd),tokens:{input:Number(totals.input_tokens),cachedInput:Number(totals.cached_input_tokens),output:Number(totals.output_tokens),reasoning:Number(totals.reasoning_tokens)},latest};
 await db.query(`update public.analysis_runs set status=$2,estimated_cost_usd=$3,input_tokens=$4,cached_input_tokens=$5,output_tokens=$6,reasoning_tokens=$7,
  completed_count=$8,failed_attempt_count=$9,deferred_count=$10,needs_review_count=$11,last_checkpoint=$12,updated_at=now(),
  completed_at=case when $2='completed' then now() else completed_at end where id=$1`,[run.id,status,checkpoint.costUsd,checkpoint.tokens.input,checkpoint.tokens.cachedInput,checkpoint.tokens.output,checkpoint.tokens.reasoning,counts.completed,Number(totals.failed_attempts),counts.deferred,counts.needs_review,JSON.stringify(checkpoint)]);
 await writeFile(new URL('full-catalog-progress.json',outputRoot),JSON.stringify({runId:run.id,analysisVersion:ANALYSIS_VERSION,model,ceilingUsd:Number(run.spending_ceiling_usd),...checkpoint},null,2));
 return checkpoint;
}
async function reserve(db,run){
 return (await db.query(`update public.analysis_runs set reserved_cost_usd=reserved_cost_usd+$2,updated_at=now() where id=$1 and status='running'
  and estimated_cost_usd+reserved_cost_usd+$2<=spending_ceiling_usd returning *`,[run.id,options.requestCostReservationUsd])).rows[0];
}
async function releaseReservations(db,run,count){
 await db.query('update public.analysis_runs set reserved_cost_usd=greatest(0,reserved_cost_usd-$2),updated_at=now() where id=$1',[run.id,options.requestCostReservationUsd*count]);
}

let coordinator;
try{
 coordinator=await connectDatabase();
 const songs=await eligibleSongs(coordinator),songById=new Map(songs.map(song=>[song.id,song]));
 assert(songs.length>CALIBRATION_TITLES.length,'Eligible catalog unexpectedly contains only the calibration set');
 let run=await prepareRun(coordinator,songs);
 const before=(await progress(coordinator,run,'prepared')).completed;
 if(options.prepareOnly){
  console.log(JSON.stringify({prepared:true,apiCalls:0,runId:run.id,analysisVersion:ANALYSIS_VERSION,model,eligible:songs.length,completed:before,remaining:songs.length-before,
   settings:{concurrency:options.concurrency,checkpointSize:options.checkpointSize,maxAttemptsPerSong:3,maxFailures:options.maxFailures,proposedSpendingCeilingUsd:options.spendingCeilingUsd,requestCostReservationUsd:options.requestCostReservationUsd}},null,2));
 }else{
  if(!apiKey)throw new Error('missing_openai_api_key');
  if(Number(run.estimated_cost_usd)+Number(run.reserved_cost_usd)>options.spendingCeilingUsd)throw new Error('spending_ceiling_below_existing_cost_or_reservations');
  run=(await coordinator.query(`update public.analysis_runs set status='running',spending_ceiling_usd=$2,concurrency=$3,checkpoint_size=$4,max_failures=$5,
   started_at=coalesce(started_at,now()),completed_at=null,updated_at=now() where id=$1 returning *`,[run.id,options.spendingCeilingUsd,options.concurrency,options.checkpointSize,options.maxFailures])).rows[0];
  const attempted=new Set(),recent=[];let failureAttempts=0,processedSinceCheckpoint=0,stopStatus=null;
  while(!stopStatus){
   const batch=[];
   for(let index=0;index<options.concurrency;index++){
    const fresh=(await coordinator.query('select * from public.analysis_runs where id=$1',[run.id])).rows[0];
    if(!budgetAllowsScheduling({estimatedCostUsd:Number(fresh.estimated_cost_usd),reservedCostUsd:Number(fresh.reserved_cost_usd),spendingCeilingUsd:Number(fresh.spending_ceiling_usd),requestCostReservationUsd:options.requestCostReservationUsd})||!await reserve(coordinator,run)){stopStatus='stopped_budget';break;}
    const job=(await coordinator.query("select * from public.claim_analysis_job('profile',900,$1,$2::uuid[])",[ANALYSIS_VERSION,[...attempted]])).rows[0];
    if(!job){await releaseReservations(coordinator,run,1);break;}
    attempted.add(job.song_id);const song=songById.get(job.song_id);assert(song,'Claimed song is outside eligible catalog');batch.push({job,song});
   }
   if(!batch.length){
    const state=await progress(coordinator,run,stopStatus||'running',recent.slice(-options.checkpointSize));
    if(stopStatus)break;
    if(state.remaining===0){stopStatus='completed';break;}
    const retryable=Number((await coordinator.query("select count(*) from public.analysis_jobs where analysis_version=$1 and job_type='profile' and status='failed' and attempt_count<max_attempts",[ANALYSIS_VERSION])).rows[0].count);
    if(retryable&&failureAttempts<options.maxFailures){attempted.clear();continue;}
    stopStatus='paused';break;
   }
   const settled=await Promise.allSettled(batch.map(({job,song})=>processJob(run.id,job,song)));
   const outcomes=settled.map((result,index)=>result.status==='fulfilled'?result.value:{title:batch[index].song.title,status:'failed',error:sanitizeWorkerError(result.reason),cost:0});
   await releaseReservations(coordinator,run,batch.length);
   for(const outcome of outcomes){recent.push(outcome);processedSinceCheckpoint++;if(outcome.status==='failed')failureAttempts++;if(outcome.status==='deferred')stopStatus='stopped_systemic';}
   if(failureAttempts>=options.maxFailures)stopStatus='stopped_failures';
   await progress(coordinator,run,stopStatus||'running',recent.slice(-options.checkpointSize));
   if(processedSinceCheckpoint>=options.checkpointSize)processedSinceCheckpoint=0;
  }
  const final=await progress(coordinator,run,stopStatus,recent.slice(-options.checkpointSize));
  console.log(JSON.stringify({runId:run.id,analysisVersion:ANALYSIS_VERSION,model,status:stopStatus,progress:final},null,2));
 }
}catch(error){console.error('Song-intelligence worker failed: '+sanitizeWorkerError(error));process.exitCode=1;}finally{await coordinator?.end();}
