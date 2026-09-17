import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {connectDatabase} from './lib/database.mjs';

const env=Object.fromEntries((await readFile(new URL('../.env.local',import.meta.url),'utf8')).split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{const at=line.indexOf('=');return [line.slice(0,at),line.slice(at+1)];}));
const url=env.EXPO_PUBLIC_SUPABASE_URL,key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw new Error('Public Supabase configuration missing.');
const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),db=await connectDatabase();
const results={recommendation:{},subscription:{},notification:{},accountDeletion:{}};
let userId,installationId;
const invoke=async(name,{token,body={},origin}={})=>fetch(`${url}/functions/v1/${name}`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
try{
 const signed=await supabase.auth.signInAnonymously();if(signed.error||!signed.data.session||!signed.data.user)throw signed.error??new Error('Anonymous test account failed.');
 userId=signed.data.user.id;let token=signed.data.session.access_token;
 installationId=randomUUID();const installationToken=randomBytes(32).toString('hex');
 const registered=await supabase.rpc('register_installation',{p_id:installationId,p_token:installationToken,p_platform:'web',p_app_version:'deployed-security-test'});if(registered.error)throw registered.error;

 let response=await invoke('recommend');results.recommendation.unauthenticatedDenied=response.status===401;
 response=await invoke('recommend',{token,origin:'https://attacker.invalid'});results.recommendation.untrustedOriginDenied=response.status===403;
 response=await invoke('recommend',{token,body:{requestId:randomUUID(),installationId,installationToken,situation:'short'}});
 results.recommendation.shortInputRejected=response.status===400&&(await response.json()).error==='situation_too_short';

 response=await invoke('apple-subscriptions');results.subscription.unauthenticatedDenied=response.status===401;
 response=await invoke('apple-subscriptions',{token,body:{signedTransactionInfo:'x'.repeat(200),installationId,installationToken}});
 results.subscription.anonymousAccountDenied=response.status===401&&(await response.json()).error==='account_required';

 await db.query("update auth.users set is_anonymous=false,raw_app_meta_data=raw_app_meta_data||'{\"security_fixture\":true}'::jsonb where id=$1",[userId]);
 const refreshed=await supabase.auth.refreshSession({refresh_token:signed.data.session.refresh_token});if(refreshed.error||!refreshed.data.session)throw refreshed.error??new Error('Session refresh failed.');token=refreshed.data.session.access_token;
 response=await invoke('apple-subscriptions',{token,body:{signedTransactionInfo:'x'.repeat(200),installationId,installationToken}});
 results.subscription.missingConfigurationFailsClosed=response.status===503&&(await response.json()).error==='purchases_not_configured';

 response=await invoke('apple-notifications',{body:{signedPayload:'x'.repeat(200)}});results.notification.invalidPayloadDenied=response.status===400;
 response=await invoke('delete-account',{token,body:{confirm:false,acknowledgeAppleBilling:false}});results.accountDeletion.requiresExplicitAcknowledgment=response.status===400;
 response=await invoke('delete-account',{token,body:{confirm:true,acknowledgeAppleBilling:true}});results.accountDeletion.deployedDeletionSucceeded=response.status===200&&(await response.json()).deleted===true;
 const afterDeletion=await supabase.auth.getUser(token);results.accountDeletion.deletedSessionRejected=!!afterDeletion.error;

 for(const group of Object.values(results))for(const [name,value] of Object.entries(group))assert.equal(value,true,name);
 await mkdir(new URL('../artifacts/security/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security/deployed-prelaunch.json',import.meta.url),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}finally{
 if(installationId){await db.query('delete from public.recommendation_runs where installation_id=$1',[installationId]).catch(()=>{});await db.query('delete from public.usage_events where installation_id=$1',[installationId]).catch(()=>{});await db.query('delete from public.installation_sessions where installation_id=$1',[installationId]).catch(()=>{});await db.query('delete from public.installations where id=$1',[installationId]).catch(()=>{});}
 if(userId)await db.query('delete from auth.users where id=$1',[userId]).catch(()=>{});await db.end();
}
