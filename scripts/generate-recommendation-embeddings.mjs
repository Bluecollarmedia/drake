import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {connectDatabase} from './lib/database.mjs';
import {stableHash} from '../server/analysis/song-intelligence.mjs';
import {buildEmbeddingDocuments,EMBEDDING_DOCUMENT_VERSION,EMBEDDING_MODEL_ID,EMBEDDING_PROVIDER_MODEL,RECOMMENDATION_ANALYSIS_VERSION,estimateEmbeddingCost} from '../server/recommendation/engine.mjs';
import {createEmbeddings} from '../server/recommendation/openai.mjs';

const secret=await readFile(new URL('../.secrets/analysis.local.json',import.meta.url),'utf8').then(text=>JSON.parse(text.replace(/^\uFEFF/,'')));
const apiKey=process.env.OPENAI_API_KEY||secret.OPENAI_API_KEY;
const batchSize=Math.max(1,Math.min(32,Number(process.env.EMBEDDING_BATCH_SIZE||16)));
const maxAttempts=3;
const outputDirectory=new URL('../artifacts/recommendations/',import.meta.url);
await mkdir(outputDirectory,{recursive:true});

const db=await connectDatabase();
let run;
try{
 const profiles=(await db.query(`select p.*,s.title,s.version_key,
   coalesce((select jsonb_agg(jsonb_build_object('text',sc.scenario_text,'variation',sc.variation) order by sc.created_at)
     from public.song_scenarios sc where sc.profile_id=p.id and sc.scenario_type='matching_language'),'[]'::jsonb) example_inputs
   from public.released_catalog_eligible_songs s join public.song_analysis_profiles p on p.song_id=s.id
   where p.analysis_version=$1 and p.review_status in ('generated','needs_review','approved') order by s.title,s.id`,[RECOMMENDATION_ANALYSIS_VERSION])).rows;
 run=(await db.query(`insert into public.embedding_runs(embedding_model,provider_model,document_version,analysis_version,requested_song_count,settings)
   values($1,$2,$3,$4,$5,$6) returning *`,[EMBEDDING_MODEL_ID,EMBEDDING_PROVIDER_MODEL,EMBEDDING_DOCUMENT_VERSION,RECOMMENDATION_ANALYSIS_VERSION,profiles.length,JSON.stringify({batchSize,maxAttempts,representations:['overall_song_meaning','situational_summary']})])).rows[0];
 const existing=(await db.query(`select song_id,embedding_type,source_hash from public.song_embeddings
   where embedding_model=$1 and analysis_version=$2 and document_version=$3`,[EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION,EMBEDDING_DOCUMENT_VERSION])).rows;
 const existingHashes=new Map(existing.map(row=>[row.song_id+':'+row.embedding_type,row.source_hash]));
 const pending=[];let skipped=0;
 for(const profile of profiles){
  const documents=buildEmbeddingDocuments(profile);
  for(const [type,input] of Object.entries(documents)){
   const sourceHash=stableHash({analysisVersion:RECOMMENDATION_ANALYSIS_VERSION,documentVersion:EMBEDDING_DOCUMENT_VERSION,profileId:profile.id,type,input});
   if(existingHashes.get(profile.song_id+':'+type)===sourceHash){skipped++;continue;}
   pending.push({profile,songId:profile.song_id,profileId:profile.id,type,input,sourceHash});
  }
 }
 let embeddedVectors=0,inputTokens=0,cost=0;const completedSongs=new Set(),failedSongs=new Set(),errors=[];
 for(let offset=0;offset<pending.length;offset+=batchSize){
  const batch=pending.slice(offset,offset+batchSize);let generated,error;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
   try{generated=await createEmbeddings(batch.map(item=>item.input),apiKey);break;}
   catch(caught){error=caught;if(attempt<maxAttempts)await new Promise(resolve=>setTimeout(resolve,attempt*1000));}
  }
  if(!generated){for(const item of batch)failedSongs.add(item.songId);errors.push({offset,error:String(error?.message||error)});continue;}
  const tokens=Number(generated.usage?.prompt_tokens||generated.usage?.total_tokens||0),batchCost=estimateEmbeddingCost(tokens);
  await db.query('begin');
  try{
   for(let index=0;index<batch.length;index++){
    const item=batch[index],vector='['+generated.vectors[index].join(',')+']';
    await db.query(`insert into public.song_embeddings(song_id,profile_id,embedding_type,embedding,embedding_model,analysis_version,source_hash,document_version,input_tokens,estimated_cost_usd,embedding_run_id)
      values($1,$2,$3,$4::extensions.vector,$5,$6,$7,$8,$9,$10,$11)
      on conflict(song_id,scenario_id,embedding_type,embedding_model,analysis_version) do update set
       profile_id=excluded.profile_id,embedding=excluded.embedding,source_hash=excluded.source_hash,document_version=excluded.document_version,
       input_tokens=excluded.input_tokens,estimated_cost_usd=excluded.estimated_cost_usd,embedding_run_id=excluded.embedding_run_id,created_at=now()`,
      [item.songId,item.profileId,item.type,vector,EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION,item.sourceHash,EMBEDDING_DOCUMENT_VERSION,Math.ceil(tokens/batch.length),batchCost/batch.length,run.id]);
    completedSongs.add(item.songId);embeddedVectors++;
   }
   inputTokens+=tokens;cost+=batchCost;
   const checkpoint={offset:offset+batch.length,totalPending:pending.length,embeddedVectors,skipped,failedSongs:failedSongs.size,inputTokens,estimatedCostUsd:Number(cost.toFixed(8))};
   await db.query(`update public.embedding_runs set embedded_song_count=$2,embedded_vector_count=$3,skipped_vector_count=$4,failed_song_count=$5,input_tokens=$6,estimated_cost_usd=$7,last_checkpoint=$8 where id=$1`,
    [run.id,completedSongs.size,embeddedVectors,skipped,failedSongs.size,inputTokens,cost,JSON.stringify(checkpoint)]);
   await db.query('commit');
   await writeFile(new URL('embedding-progress.json',outputDirectory),JSON.stringify({runId:run.id,...checkpoint},null,2));
  }catch(caught){await db.query('rollback');throw caught;}
 }
 const totalCurrent=Number((await db.query(`select count(*)::int n from (
   select song_id from public.song_embeddings where embedding_model=$1 and analysis_version=$2 and document_version=$3
     and embedding_type in ('overall_song_meaning','situational_summary') group by song_id
   having count(distinct embedding_type)=2
  ) complete`,[EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION,EMBEDDING_DOCUMENT_VERSION])).rows[0].n);
 const status=failedSongs.size?'failed':'completed';
 const report={runId:run.id,status,eligibleProfiles:profiles.length,songsWithCurrentEmbeddings:totalCurrent,vectorsGenerated:embeddedVectors,vectorsSkipped:skipped,failedSongs:[...failedSongs],errors,inputTokens,estimatedCostUsd:Number(cost.toFixed(8)),model:EMBEDDING_PROVIDER_MODEL,dimensions:1536,documentVersion:EMBEDDING_DOCUMENT_VERSION};
 await db.query(`update public.embedding_runs set status=$2,embedded_song_count=$3,embedded_vector_count=$4,skipped_vector_count=$5,failed_song_count=$6,input_tokens=$7,estimated_cost_usd=$8,last_checkpoint=$9,completed_at=now() where id=$1`,[run.id,status,totalCurrent,embeddedVectors,skipped,failedSongs.size,inputTokens,cost,JSON.stringify(report)]);
 await writeFile(new URL('embedding-report.json',outputDirectory),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}catch(error){if(run)await db.query("update public.embedding_runs set status='failed',last_checkpoint=$2,completed_at=now() where id=$1",[run.id,JSON.stringify({error:String(error?.message||error)})]).catch(()=>{});throw error;}
finally{await db.end();}
