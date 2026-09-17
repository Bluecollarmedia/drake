import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {connectDatabase} from './lib/database.mjs';

const probe=JSON.parse(await readFile(new URL('../.secrets/auth-probe.local.json',import.meta.url),'utf8'));
const db=await connectDatabase(),ids={a:randomUUID(),b:randomUUID(),installA:randomUUID(),installA2:randomUUID(),installB:randomUUID()};
const tokenA=randomBytes(32).toString('hex'),tokenA2=randomBytes(32).toString('hex'),tokenB=randomBytes(32).toString('hex');
const results={authorization:{},boundaries:{},subscription:{},operator:{},fixtures:'All fixtures and policy changes rolled back.'};
let denial=0;
const denied=async operation=>{const point=`denial_${++denial}`;await db.query(`savepoint ${point}`);try{await operation();await db.query(`release savepoint ${point}`);return false;}catch{await db.query(`rollback to savepoint ${point}`);await db.query(`release savepoint ${point}`);return true;}};
const claims=async(client,user,anonymous=false)=>{await client.query('reset role');await client.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:user,role:'authenticated',is_anonymous:anonymous})]);await client.query('set local role authenticated');};
const service=async client=>{await client.query('reset role');await client.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:'service_role'})]);await client.query('set local role service_role');};
const reserve=async(client,user,install,token,request=randomUUID())=>{await claims(client,user);return (await client.query('select public.reserve_recommendation($1,$2,$3) value',[request,install,token])).rows[0].value;};
const finish=async(client,request,status='completed',cost=.01)=>{await service(client);return (await client.query("select public.finish_recommendation_usage($1,$2,'{}',$3) value",[request,status,cost])).rows[0].value;};
const seedUsage=async(count,user,install,bucket,entitlement,periodStart,periodEnd,age='2 days')=>{
 for(let i=0;i<count;i++)await db.query(`insert into public.usage_events(user_id,installation_id,event_type,request_id,status,allowance_bucket,entitlement_id,allowance_period_start,allowance_period_end,created_at)
  values($1,$2,'recommendation',$3,'completed',$4,$5,$6,$7,now()-$8::interval)`,[user,install,randomUUID(),bucket,entitlement,periodStart,periodEnd,age]);
};
async function verifyConcurrentFinalCredit(){
 const user=randomUUID(),install1=randomUUID(),install2=randomUUID(),token1=randomBytes(32).toString('hex'),token2=randomBytes(32).toString('hex');
 const original='concurrent-'+randomUUID(),start=new Date(Date.now()-10*86400000).toISOString(),end=new Date(Date.now()+20*86400000).toISOString();
 try{
  const template=(await db.query('select instance_id,aud from auth.users where id=$1',[probe.user.id])).rows[0];
  await db.query(`insert into auth.users(instance_id,id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,is_anonymous)
   values($1,$2,$3,'authenticated',$4,now(),'{}','{}',now(),now(),false)`,[template.instance_id,user,template.aud,`concurrent-${user}@example.invalid`]);
  for(const [id,token] of [[install1,token1],[install2,token2]]){await db.query("insert into public.installations(id,installation_token_hash,platform,app_version,user_id) values($1,extensions.digest($2,'sha256'),'ios','test',$3)",[id,token,user]);await db.query('insert into public.installation_sessions(installation_id,user_id) values($1,$2)',[id,user]);}
  const entitlement=(await db.query(`insert into public.entitlements(user_id,product_id,source,status,original_transaction_id,verified_at,plan_code,current_period_start,current_period_end,environment,app_account_token)
   values($1,'com.whichdrake.app.fullaccess.monthly','apple','active',$2,now(),'monthly',$3,$4,'Sandbox',$1) returning id`,[user,original,start,end])).rows[0].id;
  for(let i=0;i<49;i++)await db.query(`insert into public.usage_events(user_id,installation_id,event_type,request_id,status,allowance_bucket,entitlement_id,allowance_period_start,allowance_period_end,created_at)
   values($1,$2,'recommendation',$3,'completed','monthly',$4,$5,$6,now()-interval '2 days')`,[user,install1,randomUUID(),entitlement,start,end]);
  const run=async(install,token)=>{const client=await connectDatabase();const request=randomUUID();try{await client.query('begin');await claims(client,user);await client.query('select public.reserve_recommendation($1,$2,$3)',[request,install,token]);await client.query('commit');return {ok:true,request};}catch{await client.query('rollback').catch(()=>{});return {ok:false,request};}finally{await client.end();}};
  const outcomes=await Promise.all([run(install1,token1),run(install2,token2)]),winner=outcomes.find(value=>value.ok);
  if(winner){await db.query('begin');await service(db);await db.query("select public.finish_recommendation_usage($1,'failed','{}',0)",[winner.request]);await db.query('commit');}
  return outcomes.filter(value=>value.ok).length===1;
 }finally{
  await db.query('reset role').catch(()=>{});await db.query('begin');
  await db.query('delete from public.usage_events where user_id=$1 or installation_id in ($2,$3)',[user,install1,install2]);
  await db.query('delete from public.installation_sessions where installation_id in ($1,$2)',[install1,install2]);
  await db.query('delete from public.installations where id in ($1,$2)',[install1,install2]);
  await db.query('delete from auth.users where id=$1',[user]);await db.query('commit');
 }
}
try{
 await db.query('begin');
 const template=(await db.query('select instance_id,aud from auth.users where id=$1',[probe.user.id])).rows[0];assert(template);
 for(const [id,email] of [[ids.a,`prelaunch-a-${ids.a}@example.invalid`],[ids.b,`prelaunch-b-${ids.b}@example.invalid`]]){
  await db.query(`insert into auth.users(instance_id,id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,is_anonymous)
   values($1,$2,$3,'authenticated',$4,now(),'{}','{}',now(),now(),false)`,[template.instance_id,id,template.aud,email]);
 }
 for(const [id,token,user] of [[ids.installA,tokenA,ids.a],[ids.installA2,tokenA2,ids.a],[ids.installB,tokenB,ids.b]]){
  await db.query("insert into public.installations(id,installation_token_hash,platform,app_version,user_id) values($1,extensions.digest($2,'sha256'),'ios','test',$3)",[id,token,user]);
  await db.query('insert into public.installation_sessions(installation_id,user_id) values($1,$2)',[id,user]);
 }
 await db.query("update public.usage_policies set recommendations_enabled=true,global_budgets_enabled=true,global_daily_budget_usd=1000,global_monthly_budget_usd=1000,recommendation_cost_reservation_usd=.1,recommendation_rate_limit_per_minute=5,recommendation_rate_limit_per_day=20 where id='default'");
 await db.query('update public.recommendation_test_access set active=false');
 const song=(await db.query('select id from public.released_catalog_eligible_songs limit 1')).rows[0].id;

 await claims(db,ids.a);await db.query('insert into public.saved_recommendations(user_id,song_id,recommendation_explanation) values($1,$2,$3)',[ids.a,song,'Private A fixture']);
 await claims(db,ids.b);
 results.authorization.savedCrossAccount=(await db.query('select count(*)::int count from public.saved_recommendations')).rows[0].count===0;
 results.authorization.savedDeleteBlocked=(await db.query('delete from public.saved_recommendations where user_id=$1 returning id',[ids.a])).rowCount===0;
 results.authorization.profileCrossAccount=(await db.query('select count(*)::int count from public.profiles where id=$1',[ids.a])).rows[0].count===0;
 results.authorization.installationsDenied=await denied(()=>db.query('select * from public.installations limit 1'));
 results.authorization.usageDenied=await denied(()=>db.query('select * from public.usage_events limit 1'));
 results.authorization.semanticProfilesDenied=await denied(()=>db.query('select * from public.song_analysis_profiles limit 1'));
 results.authorization.embeddingsDenied=await denied(()=>db.query('select * from public.song_embeddings limit 1'));
 results.authorization.recommendationRunsDenied=await denied(()=>db.query('select * from public.recommendation_runs limit 1'));
 results.authorization.operatorBudgetsDenied=await denied(()=>db.query('select * from public.operator_budget_periods limit 1'));
 results.authorization.testAccessDenied=await denied(()=>db.query('select * from public.recommendation_test_access limit 1'));
 results.authorization.finishRpcDenied=await denied(()=>db.query("select public.finish_recommendation_usage($1,'failed','{}',0)",[randomUUID()]));

 // FREE: exactly three successful reservations; the fourth is denied.
 await service(db);await db.query("delete from public.usage_events where user_id=$1",[ids.a]);
 for(let n=1;n<=3;n++){const req=randomUUID();assert((await reserve(db,ids.a,ids.installA,tokenA,req)).reserved);await finish(db,req);}
 results.boundaries.free1to3=true;
 results.boundaries.free4Denied=await denied(()=>reserve(db,ids.a,ids.installA,tokenA));

 // MONTHLY: requests 49 and 50 pass, 51 is denied. Historical usage avoids short-term limits.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);
 const monthStart=new Date(Date.now()-10*86400000).toISOString(),monthEnd=new Date(Date.now()+20*86400000).toISOString();
 const monthly=(await db.query(`insert into public.entitlements(user_id,product_id,source,status,original_transaction_id,verified_at,plan_code,current_period_start,current_period_end,environment,app_account_token)
  values($1,'com.whichdrake.app.fullaccess.monthly','apple','active',$2,now(),'monthly',$3,$4,'Sandbox',$1) returning id`,[ids.a,'m-'+randomUUID(),monthStart,monthEnd])).rows[0].id;
 await seedUsage(48,ids.a,ids.installA,'monthly',monthly,monthStart,monthEnd);
 for(const n of [49,50]){const req=randomUUID();assert((await reserve(db,ids.a,ids.installA,tokenA,req)).reserved);await finish(db,req);results.boundaries[`monthly${n}`]=true;}
 results.boundaries.monthly51Denied=await denied(()=>reserve(db,ids.a,ids.installA,tokenA));

 // ANNUAL: requests 299 and 300 pass, 301 is denied.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await db.query('update public.entitlements set status=\'expired\' where id=$1',[monthly]);
 const yearStart=new Date(Date.now()-100*86400000).toISOString(),yearEnd=new Date(Date.now()+265*86400000).toISOString();
 const annual=(await db.query(`insert into public.entitlements(user_id,product_id,source,status,original_transaction_id,verified_at,plan_code,current_period_start,current_period_end,environment,app_account_token)
  values($1,'com.whichdrake.app.fullaccess.annual','apple','active',$2,now(),'annual',$3,$4,'Sandbox',$1) returning id`,[ids.a,'a-'+randomUUID(),yearStart,yearEnd])).rows[0].id;
 await seedUsage(298,ids.a,ids.installA,'annual',annual,yearStart,yearEnd);
 for(const n of [299,300]){const req=randomUUID();assert((await reserve(db,ids.a,ids.installA,tokenA,req)).reserved);await finish(db,req);results.boundaries[`annual${n}`]=true;}
 results.boundaries.annual301Denied=await denied(()=>reserve(db,ids.a,ids.installA,tokenA));

 // Short-term 5/minute and rolling 20/day limits.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await seedUsage(5,ids.a,ids.installA,'monthly',monthly,monthStart,monthEnd,'10 seconds');
 results.boundaries.minuteSixthDenied=await denied(()=>reserve(db,ids.a,ids.installA,tokenA));
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await seedUsage(20,ids.a,ids.installA,'monthly',monthly,monthStart,monthEnd,'2 hours');
 results.boundaries.dayTwentyFirstDenied=await denied(()=>reserve(db,ids.a,ids.installA,tokenA));

 // Duplicate request IDs are account-wide, even across installations.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);const duplicate=randomUUID();
 assert((await reserve(db,ids.a,ids.installA,tokenA,duplicate)).existing===false);
 results.boundaries.replayAcrossSession=(await reserve(db,ids.a,ids.installA2,tokenA2,duplicate)).existing===true;
 await finish(db,duplicate);

 // Failed model calls release the user credit but keep measured operator cost.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await db.query('delete from public.operator_budget_periods');
 const failed=randomUUID();await reserve(db,ids.a,ids.installA,tokenA,failed);await finish(db,failed,'failed',.0123);
 const failedRow=(await db.query('select status,actual_cost_usd from public.usage_events where request_id=$1',[failed])).rows[0];
 const budget=(await db.query("select committed_cost_usd,reserved_cost_usd from public.operator_budget_periods where period_kind='day'")).rows[0];
 results.operator.failedCallCreditReleased=failedRow.status==='failed'&&failedRow.actual_cost_usd===null;
 results.operator.failedCallCostRecorded=Number(budget.committed_cost_usd)===.0123&&Number(budget.reserved_cost_usd)===0;

 // A process crash cannot reopen global budget after the lease expires. Unknown actual cost
 // is conservatively charged at the reserved amount while the user credit is released.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await db.query('delete from public.operator_budget_periods');
 const dayStart=(await db.query("select date_trunc('day',now() at time zone 'UTC') at time zone 'UTC' value")).rows[0].value;
 const monthStartValue=(await db.query("select date_trunc('month',now() at time zone 'UTC') at time zone 'UTC' value")).rows[0].value;
 await db.query("insert into public.operator_budget_periods(period_kind,period_start,period_end,reserved_cost_usd) values('day',$1,$1::timestamptz+interval '1 day',.1),('month',$2,$2::timestamptz+interval '1 month',.1)",[dayStart,monthStartValue]);
 const abandoned=randomUUID();await db.query(`insert into public.usage_events(user_id,installation_id,event_type,request_id,status,allowance_bucket,reserved_cost_usd,reservation_expires_at,budget_day_start,budget_month_start)
  values($1,$2,'recommendation',$3,'reserved','free',.1,now()-interval '1 minute',$4,$5)`,[ids.a,ids.installA,abandoned,dayStart,monthStartValue]);
 const afterCrash=randomUUID();await reserve(db,ids.a,ids.installA,tokenA,afterCrash);
 await service(db);
 const crashBudget=(await db.query("select reserved_cost_usd,committed_cost_usd from public.operator_budget_periods where period_kind='day'")).rows[0];
 const crashEvent=(await db.query('select status from public.usage_events where request_id=$1',[abandoned])).rows[0];
 results.operator.abandonedCallConservativelyCommitted=crashEvent.status==='failed'&&Number(crashBudget.committed_cost_usd)===.1&&Number(crashBudget.reserved_cost_usd)===.1;
 await finish(db,afterCrash,'failed',0);

 // A ceiling stops the next reservation without rolling back completed work.
 await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.a]);await db.query('delete from public.operator_budget_periods');
 await db.query("update public.usage_policies set global_daily_budget_usd=.15,global_monthly_budget_usd=.15,recommendation_cost_reservation_usd=.1 where id='default'");
 const budgetReq=randomUUID();await reserve(db,ids.a,ids.installA,tokenA,budgetReq);
 results.operator.globalCeilingDenied=await denied(()=>reserve(db,ids.a,ids.installA2,tokenA2));
 await finish(db,budgetReq,'completed',.02);

 // Apple application is service-only and appAccountToken must bind to the Supabase account.
 await service(db);
 results.subscription.clientSpoofDenied=await (async()=>{await claims(db,ids.a);return denied(()=>db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly','spoof','spoof',now(),now()+interval '1 month','active','Sandbox',true,$2,'PURCHASED','{}')`,[ids.a,ids.a]));})();
 await service(db);
 results.subscription.accountTokenMismatchDenied=await denied(()=>db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly',$2,$3,now(),now()+interval '1 month','active','Sandbox',true,$4,'PURCHASED','{}')`,[ids.a,'x-'+randomUUID(),'y-'+randomUUID(),ids.b]));
 const lifecycleOriginal='ok-'+randomUUID();
 const applied=(await db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly',$2,$3,now(),now()+interval '1 month','active','Sandbox',true,$1,'PURCHASED','{}') id`,[ids.b,lifecycleOriginal,'txn-'+randomUUID()])).rows[0].id;
 results.subscription.serviceVerifiedApply=typeof applied==='string';

 // Cancellation keeps access through the verified paid period; a new period resets usage.
 await db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly',$2,$3,now(),now()+interval '1 month','active','Sandbox',false,$1,'PURCHASED','{}')`,[ids.b,lifecycleOriginal,'cancel-'+randomUUID()]);
 const cancelledRequest=randomUUID();
 results.subscription.cancelledStillActiveThroughPeriod=(await reserve(db,ids.b,ids.installB,tokenB,cancelledRequest)).plan==='monthly';
 await finish(db,cancelledRequest,'failed',0);
 await service(db);await db.query("update public.usage_events set created_at=now()-interval '40 days' where user_id=$1",[ids.b]);
 await db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly',$2,$3,now(),now()+interval '1 month','active','Sandbox',true,$1,'PURCHASED','{}')`,[ids.b,lifecycleOriginal,'renew-'+randomUUID()]);
 const renewedRequest=randomUUID(),renewed=await reserve(db,ids.b,ids.installB,tokenB,renewedRequest);
 results.subscription.renewalResetsPeriod=renewed.plan==='monthly'&&renewed.remaining_after_reservation===49;
 await finish(db,renewedRequest,'failed',0);

 // Non-entitled Apple states never grant Full Access; a user only falls back to unused free allowance.
 for(const [state,key] of [['billing_retry','failedRenewalFallsBackToFree'],['expired','expirationFallsBackToFree'],['refunded','refundRemovesPaidAccess'],['revoked','revocationRemovesPaidAccess']]){
  await service(db);await db.query('delete from public.usage_events where user_id=$1',[ids.b]);
  await db.query(`select public.apply_apple_subscription($1,'com.whichdrake.app.fullaccess.monthly',$2,$3,now()-interval '2 months',now()-interval '1 month',$4,'Sandbox',false,$1,'PURCHASED','{}')`,[ids.b,lifecycleOriginal,state+'-'+randomUUID(),state]);
  const request=randomUUID(),reservation=await reserve(db,ids.b,ids.installB,tokenB,request);
  results.subscription[key]=reservation.plan==='free'&&reservation.remaining_after_reservation===2;
  await finish(db,request,'failed',0);
 }

 await db.query('rollback');
 results.boundaries.simultaneousFinalCredit=await verifyConcurrentFinalCredit();
 for(const [groupName,group] of Object.entries(results))if(group&&typeof group==='object'&&!Array.isArray(group))for(const [name,value] of Object.entries(group))if(typeof value==='boolean')assert.equal(value,true,`${groupName}.${name}`);
 await mkdir(new URL('../artifacts/security/',import.meta.url),{recursive:true});
 await writeFile(new URL('../artifacts/security/prelaunch-hardening.json',import.meta.url),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}catch(error){await db.query('rollback').catch(()=>{});console.error('Pre-launch verification failed: '+error.message);process.exitCode=1;}finally{await db.end();}
