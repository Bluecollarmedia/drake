import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {connectDatabase} from './lib/database.mjs';

const env=Object.fromEntries((await readFile(new URL('../.env.local',import.meta.url),'utf8')).split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{const at=line.indexOf('=');return [line.slice(0,at),line.slice(at+1)];}));
const url=env.EXPO_PUBLIC_SUPABASE_URL,key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw new Error('Public Supabase configuration missing.');
const client=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const a=client(),b=client(),db=await connectDatabase();
const users=[];const installs=[];const results={http:{},crossAccount:{},privateInfrastructure:{}};
async function signUp(target,label){
 const response=await target.auth.signInAnonymously();
 if(response.error||!response.data.session||!response.data.user)throw response.error??new Error('Live anonymous signup did not return a session.');
 users.push(response.data.user.id);
 await db.query('update auth.users set is_anonymous=false,raw_app_meta_data=raw_app_meta_data||$2::jsonb where id=$1',[response.data.user.id,JSON.stringify({security_fixture:label})]);
 const refreshed=await target.auth.refreshSession({refresh_token:response.data.session.refresh_token});
 if(refreshed.error||!refreshed.data.user||refreshed.data.user.is_anonymous!==false)throw refreshed.error??new Error('Security fixture account upgrade failed.');
 return refreshed.data.user;
}
try{
 const userA=await signUp(a,'a'),userB=await signUp(b,'b');
 const setup=async(target,user)=>{const id=randomUUID(),token=randomBytes(32).toString('hex');const {error}=await target.rpc('register_installation',{p_id:id,p_token:token,p_platform:'web',p_app_version:'security-test'});if(error)throw error;installs.push(id);return {id,token,user};};
 await setup(a,userA);const installB=await setup(b,userB);
 const song=(await db.query('select id from public.released_catalog_eligible_songs limit 1')).rows[0].id;
 const inserted=await a.from('saved_recommendations').insert({user_id:userA.id,song_id:song,recommendation_explanation:'Cross-account security fixture',retain_original_input:false,original_user_input:null}).select('id').single();
 if(inserted.error)throw inserted.error;
 results.crossAccount.userAOwnSaved=!!inserted.data?.id;
 const bSaved=await b.from('saved_recommendations').select('id');
 results.crossAccount.userBCannotReadA=bSaved.error===null&&bSaved.data?.length===0;
 const bDelete=await b.from('saved_recommendations').delete().eq('id',inserted.data.id).select('id');
 results.crossAccount.userBCannotDeleteA=bDelete.error===null&&bDelete.data?.length===0;
 const historyId=randomUUID(),historyRequestId=randomUUID();
 await db.query(`insert into public.recommendation_history(id,request_id,user_id,song_id,situation_text,result_payload)
   values($1,$2,$3,$4,$5,$6::jsonb)`,[historyId,historyRequestId,userA.id,song,'A private situation for the History isolation fixture.',JSON.stringify({outcome:'match',requestId:historyRequestId,song:{id:song,title:'Fixture',artists:['Drake'],version:'original',release:null,artworkUrl:null,links:{}},explanation:'Fixture explanation',confidence:.9})]);
 const aHistory=await a.from('recommendation_history').select('id,situation_text').eq('id',historyId).single();
 results.crossAccount.userAOwnHistory=aHistory.error===null&&aHistory.data?.id===historyId;
 const bHistory=await b.from('recommendation_history').select('id,situation_text').eq('id',historyId);
 results.crossAccount.userBCannotReadAHistory=bHistory.error===null&&bHistory.data?.length===0;
 const bHistoryDelete=await b.from('recommendation_history').delete().eq('id',historyId).select('id');
 results.crossAccount.userBCannotDeleteAHistory=bHistoryDelete.error===null&&bHistoryDelete.data?.length===0;
 const clientHistoryInsert=await a.from('recommendation_history').insert({request_id:randomUUID(),user_id:userA.id,song_id:song,situation_text:'Clients must not create their own History records.',result_payload:{outcome:'match'}});
 results.crossAccount.clientCannotInsertHistory=!!clientHistoryInsert.error;
 const clientHistoryUpdate=await a.from('recommendation_history').update({situation_text:'Clients must not rewrite History.'}).eq('id',historyId);
 results.crossAccount.clientCannotUpdateHistory=!!clientHistoryUpdate.error;
 const bProfile=await b.from('profiles').select('id').eq('id',userA.id);
 results.crossAccount.userBCannotReadAProfile=bProfile.error===null&&bProfile.data?.length===0;
 const bEntitlement=await b.from('entitlements').select('id,user_id').eq('user_id',userA.id);
 results.crossAccount.userBCannotReadAEntitlement=bEntitlement.error===null&&bEntitlement.data?.length===0;
 const wrongInstall=await a.rpc('get_usage_status',{p_id:installB.id,p_token:installB.token});
 results.crossAccount.userACannotUseBInstallation=!!wrongInstall.error;
 for(const [name,table] of [['usage','usage_events'],['installations','installations'],['profilesInternal','song_analysis_profiles'],['embeddings','song_embeddings'],['runs','recommendation_runs'],['budgets','operator_budget_periods'],['testAccess','recommendation_test_access']]){
  const response=await a.from(table).select('*').limit(1);results.privateInfrastructure[name]=!!response.error;
 }
 results.privateInfrastructure.finishRpcDenied=!!(await a.rpc('finish_recommendation_usage',{p_request_id:randomUUID(),p_status:'failed',p_metadata:{},p_actual_cost_usd:0})).error;
 const noAuth=await fetch(`${url}/functions/v1/recommend`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key},body:'{}'});
 results.http.unauthenticatedRecommendationDenied=noAuth.status===401;
 const forged=await fetch(`${url}/functions/v1/recommend`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:'Bearer forged.token.value'},body:'{}'});
 results.http.forgedTokenDenied=forged.status===401;
 for(const group of Object.values(results))for(const [name,value] of Object.entries(group))assert.equal(value,true,name);
 await mkdir(new URL('../artifacts/security/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security/live-cross-account.json',import.meta.url),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}catch(error){console.error('Live cross-account security test failed: '+error.message);process.exitCode=1;}finally{
 try{await db.query('begin');if(installs.length){await db.query('delete from public.usage_events where installation_id=any($1::uuid[])',[installs]);await db.query('delete from public.recommendation_runs where installation_id=any($1::uuid[])',[installs]);await db.query('delete from public.installation_sessions where installation_id=any($1::uuid[])',[installs]);await db.query('delete from public.installations where id=any($1::uuid[])',[installs]);}if(users.length)await db.query('delete from auth.users where id=any($1::uuid[])',[users]);await db.query('commit');}catch{await db.query('rollback').catch(()=>{});}await db.end();
}
