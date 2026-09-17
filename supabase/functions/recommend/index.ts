// Server-only Supabase Edge Function. Raw situations are retained only in the requesting user's RLS-protected History after a successful match.
import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {buildRerankingInput,candidateForReranking,DEFAULT_SHORTLIST_SIZE,EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION,RERANKING_MODEL,estimateEmbeddingCost,estimateRerankingCost,normalizeSituation} from '../_shared/recommendation-engine.mjs';
import {createEmbeddings,rerankRecommendation} from '../_shared/openai.mjs';

const allowedOrigins=new Set((Deno.env.get('ALLOWED_WEB_ORIGINS')||'http://localhost:8081,http://127.0.0.1:8081').split(',').map(value=>value.trim()).filter(Boolean));
function responseHeaders(request:Request){const origin=request.headers.get('Origin');return {
 'Access-Control-Allow-Origin':origin&&allowedOrigins.has(origin)?origin:'',
 'Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS',
};}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const safeCode=(error:unknown)=>String(error instanceof Error?error.message:error).split(':')[0].replace(/[^a-z0-9_ -]/gi,'').slice(0,80);
function reservationResponse(error:unknown){const message=String((error as {message?:string})?.message||'').toLowerCase();
 if(message.includes('disabled'))return {code:'recommendations_disabled',status:503};
 if(message.includes('monthly recommendation'))return {code:'monthly_recommendation_limit',status:429};
 if(message.includes('annual recommendation'))return {code:'annual_recommendation_limit',status:429};
 if(message.includes('free recommendation')||message.includes('allowance'))return {code:'free_recommendation_limit',status:429};
 if(message.includes('minute rate'))return {code:'minute_rate_limit',status:429};
 if(message.includes('daily rate'))return {code:'daily_rate_limit',status:429};
 if(message.includes('global operator budget'))return {code:'recommendation_service_unavailable',status:503};
 if(message.includes('authentication')||message.includes('installation'))return {code:'authentication_required',status:401};
 return {code:'recommendation_unavailable',status:503};}
function failureCategory(error:unknown){const value=safeCode(error).toLowerCase();if(value.includes('candidate'))return 'candidate_data';if(value.includes('openai')||value.includes('response')||value.includes('embedding'))return 'model_provider';return 'internal';}
async function sha256(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}

Deno.serve(async request=>{
 const cors=responseHeaders(request),origin=request.headers.get('Origin');
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(origin&&!allowedOrigins.has(origin))return json({error:'origin_not_allowed'},403);
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 const length=Number(request.headers.get('content-length')||0);if(length>12_000)return json({error:'request_too_large'},413);
 const authorization=request.headers.get('Authorization');
 if(!authorization?.startsWith('Bearer '))return json({error:'authentication_required'},401);
 const url=Deno.env.get('SUPABASE_URL'),publicKey=Deno.env.get('SUPABASE_ANON_KEY'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),apiKey=Deno.env.get('OPENAI_API_KEY');
 if(!url||!publicKey||!serviceKey||!apiKey)return json({error:'recommendation_service_unavailable'},503);
 const userClient=createClient(url,publicKey,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:userError}=await userClient.auth.getUser();
 if(userError||!user)return json({error:'authentication_required'},401);
 await service.from('recommendation_runs').update({result_payload:null}).lt('expires_at',new Date().toISOString()).not('result_payload','is',null);
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return json({error:'invalid_json'},400);}
 const requestId=String(body.requestId||''),installationId=String(body.installationId||''),installationToken=String(body.installationToken||'');
 if(!uuid.test(requestId)||!uuid.test(installationId)||!/^[a-f0-9]{64}$/.test(installationToken))return json({error:'invalid_request_identity'},400);
 let situation:string;
 try{situation=normalizeSituation(body.situation);}catch(error){const code=safeCode(error);return json({error:code==='situation_too_short'||code==='situation_too_long'?code:'invalid_situation'},400);}
 const {data:reservation,error:reservationError}=await userClient.rpc('reserve_recommendation',{p_request_id:requestId,p_installation_id:installationId,p_installation_token:installationToken});
 if(reservationError){const response=reservationResponse(reservationError);let usage:unknown=null;
  if(['monthly_recommendation_limit','annual_recommendation_limit','free_recommendation_limit'].includes(response.code)){
   const status=await userClient.rpc('get_usage_status',{p_id:installationId,p_token:installationToken});usage=status.data;
  }
  return json({error:response.code,usage},response.status);
 }
 if(reservation?.existing){
  const {data:prior}=await service.from('recommendation_runs').select('status,result_payload,expires_at').eq('id',requestId).eq('user_id',user.id).eq('installation_id',installationId).maybeSingle();
  if(prior?.status==='completed'&&prior.result_payload&&new Date(prior.expires_at)>new Date())return json(prior.result_payload);
  return json({error:'request_already_processing_or_expired'},409);
 }
 const inputHash=await sha256(situation),shortlistSize=DEFAULT_SHORTLIST_SIZE;let incurredCost=0;
 await service.from('recommendation_runs').insert({id:requestId,user_id:user.id,installation_id:installationId,input_hash:inputHash,input_character_count:situation.length,analysis_version:RECOMMENDATION_ANALYSIS_VERSION,embedding_model:EMBEDDING_MODEL_ID,reranking_model:RERANKING_MODEL,shortlist_size:shortlistSize});
 try{
  const embedded=await createEmbeddings([situation],apiKey);
  const embeddingTokens=Number(embedded.usage?.prompt_tokens||embedded.usage?.total_tokens||0);incurredCost=estimateEmbeddingCost(embeddingTokens);
  const vector='['+embedded.vectors[0].join(',')+']';
  const {data:retrieved,error:matchError}=await service.rpc('match_recommendation_candidates',{p_query_embedding:vector,p_embedding_model:EMBEDDING_MODEL_ID,p_analysis_version:RECOMMENDATION_ANALYSIS_VERSION,p_limit:shortlistSize});
  if(matchError)throw matchError;if(!retrieved||retrieved.length<5)throw new Error('insufficient_retrieval_candidates');
  const profileIds=retrieved.map((item:Record<string,unknown>)=>item.profile_id);
  const [{data:profiles,error:profileError},{data:scenarios,error:scenarioError}]=await Promise.all([
   service.from('song_analysis_profiles').select('*').in('id',profileIds),
   service.from('song_scenarios').select('profile_id,scenario_text,variation').in('profile_id',profileIds).eq('scenario_type','matching_language'),
  ]);
  if(profileError||scenarioError)throw profileError||scenarioError;
  const examples=new Map<string,unknown[]>();for(const item of scenarios||[]){const list=examples.get(item.profile_id)||[];list.push({text:item.scenario_text,variation:item.variation});examples.set(item.profile_id,list);}
  const profileMap=new Map((profiles||[]).map((profile:Record<string,unknown>)=>[profile.id,{...profile,example_inputs:examples.get(String(profile.id))||[]}]));
  const candidates=retrieved.map((row:Record<string,unknown>)=>candidateForReranking({...profileMap.get(row.profile_id),title:row.title},row));
  let reranked;
  try{reranked=await rerankRecommendation(buildRerankingInput(situation,candidates),candidates.map(item=>item.songId),apiKey,{safetyIdentifier:'install-'+await sha256(installationId)});}
  catch(error){incurredCost+=estimateRerankingCost((error as {usage?:unknown})?.usage);throw error;}
  const rerankUsage=reranked.usage||{};incurredCost+=estimateRerankingCost(rerankUsage);
  const common={requestId,confidence:reranked.result.confidence,explanation:reranked.result.explanation};let result:Record<string,unknown>;let selectedSongId:string|null=null;
  if(reranked.result.outcome==='no_strong_match'){
   result={...common,outcome:'no_strong_match',message:'No perfect Drake for this one.',guidance:'We couldn’t find a song that strongly matches what you’re going through. Try giving us a little more detail.'};
  }else{
   const selected=candidates.find(item=>item.songId===reranked.result.selectedSongId);if(!selected)throw new Error('selected_candidate_missing');selectedSongId=selected.songId;
   const [{data:song},{data:credits},{data:links},{data:appearances}]=await Promise.all([
    service.from('songs').select('id,title,version_key').eq('id',selected.songId).single(),
    service.from('song_artists').select('role,credit_order,artists(name)').eq('song_id',selected.songId).order('credit_order'),
    service.from('song_provider_ids').select('provider,url').eq('song_id',selected.songId),
    service.from('release_tracks').select('track_number,releases(title,release_date,artwork)').eq('song_id',selected.songId).order('created_at').limit(12),
   ]);
   const normalizedAppearances=(appearances||[]).map((item:any)=>({track_number:item.track_number,release:Array.isArray(item.releases)?item.releases[0]:item.releases})).filter((item:any)=>item.release);
   const displayAppearance=normalizedAppearances.find((item:any)=>Array.isArray(item.release.artwork)&&item.release.artwork.some((art:any)=>typeof art?.url==='string'&&art.url.startsWith('https://')))||normalizedAppearances[0]||null;
   const artworkUrl=displayAppearance?.release?.artwork?.find((art:any)=>typeof art?.url==='string'&&art.url.startsWith('https://'))?.url||null;
   const release=displayAppearance?.release?{title:displayAppearance.release.title,release_date:displayAppearance.release.release_date}:null;
   result={...common,outcome:'match',song:{id:song?.id||selected.songId,title:song?.title||selected.title,version:song?.version_key||selected.version,artists:(credits||[]).map((item:any)=>item.artists?.name).filter(Boolean),release,artworkUrl,links:Object.fromEntries((links||[]).filter(item=>item.url).map(item=>[item.provider,item.url]))}};
  }
  await service.from('recommendation_runs').update({status:'completed',outcome:reranked.result.outcome,selected_song_id:selectedSongId,confidence:reranked.result.confidence,retrieved_candidates:retrieved.map((item:Record<string,unknown>)=>({songId:item.song_id,title:item.title,retrievalScore:item.retrieval_score})),result_payload:result,embedding_input_tokens:embeddingTokens,reranking_input_tokens:Number(rerankUsage.input_tokens||0),reranking_cached_input_tokens:Number(rerankUsage.input_tokens_details?.cached_tokens||0),reranking_output_tokens:Number(rerankUsage.output_tokens||0),estimated_cost_usd:incurredCost,model_snapshot:reranked.model,completed_at:new Date().toISOString()}).eq('id',requestId);
  if(reranked.result.outcome==='match'&&selectedSongId){
   const {error:historyError}=await service.from('recommendation_history').upsert({request_id:requestId,user_id:user.id,song_id:selectedSongId,situation_text:situation,result_payload:result},{onConflict:'request_id'});
   if(historyError)console.error('recommendation_history_failed');
  }
  await service.rpc('finish_recommendation_usage',{p_request_id:requestId,p_status:'completed',p_metadata:{recommendation_run_id:requestId,outcome:reranked.result.outcome},p_actual_cost_usd:incurredCost});
  return json(result);
 }catch(error){
  const errorCode=failureCategory(error);await service.from('recommendation_runs').update({status:'failed',error_code:errorCode,estimated_cost_usd:incurredCost,completed_at:new Date().toISOString()}).eq('id',requestId);
  await service.rpc('finish_recommendation_usage',{p_request_id:requestId,p_status:'failed',p_metadata:{recommendation_run_id:requestId},p_actual_cost_usd:incurredCost});
  console.error('recommendation_failed',errorCode);return json({error:'recommendation_failed'},502);
 }
});
