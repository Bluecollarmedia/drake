import {createClient} from '@supabase/supabase-js';
import {randomBytes,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {connectDatabase} from './lib/database.mjs';

const env=Object.fromEntries((await readFile(new URL('../.env.local',import.meta.url),'utf8')).split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{const at=line.indexOf('=');return [line.slice(0,at),line.slice(at+1)];}));
const url=env.EXPO_PUBLIC_SUPABASE_URL,key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw new Error('Public Supabase configuration is missing.');
const allTests=[
 ['breakup','We ended things last week. It was mutual, but the quiet after having someone around every day is hitting me now.'],
 ['love but separate','I still love her and I know she loves me, but being together right now keeps hurting both of us.'],
 ['wanting an ex back','I keep replaying the good parts with my ex and honestly I want another chance, even if I know I might get rejected.'],
 ['betrayal','I trusted her completely and found out she was lying to me the whole time. I am hurt, angry, and done being played.'],
 ['missing one person','I am not lonely in general. I just miss this one person and wish I could hear their voice tonight.'],
 ['general loneliness','I can be in a room full of people and still feel like nobody really knows me.'],
 ['confidence','I feel untouchable today. I know exactly what I bring and I do not need anybody to validate it.'],
 ['proving doubters wrong','People used to laugh at my plans. Now the work is paying off and they have to admit I was right.'],
 ['sudden success','My career took off almost overnight and my whole life is changing faster than I can process.'],
 ['success with loneliness','I finally have the money and recognition I chased, but I feel farther from home and everyone who knew the old me.'],
 ['success with overwhelm','Everything I wanted is happening at once. I am grateful and successful, but it is honestly too much to take in.'],
 ['attraction','She walked in and the entire room noticed. I cannot stop thinking about how badly I want her.'],
 ['polished admiration','She is always elegant, ambitious, and perfectly put together. I admire how expensive and composed her whole presence feels.'],
 ['guilt','She is devastated by our breakup and I am doing okay. I care about her, and I feel awful that I cannot feel the same pain.'],
 ['regret','I acted too proud when I had the chance to fix things. Now it is over and I cannot stop thinking about what I should have said.'],
 ['family tension','My family loves me, but success changed the way we talk. I feel responsible for everyone and resentful that they do not understand the pressure.'],
 ['friendship problems','One of my closest friends switched up when things got competitive. I miss who we were, but I do not trust him anymore.'],
 ['ambition','I am nowhere near where I want to be yet. I am exhausted, but I still want to outwork everybody and build something undeniable.'],
 ['grief and loss','Someone I loved is gone, and random little memories keep bringing the loss back when I least expect it.'],
 ['misunderstood','Everybody thinks they know what kind of person I am from the outside, but nobody listens when I explain what is really happening.'],
 ['vague','I do not even know bro, everything just feels weird lately and I cannot tell what is actually wrong.'],
 ['competing emotions','I am proud that I finally made it, suspicious of everyone suddenly around me, homesick, and somehow still excited for what comes next.'],
];
const categoryArgument=process.argv.find(value=>value.startsWith('--categories='))?.slice('--categories='.length)??process.env.PHASE5_TEST_CATEGORIES??'';
const requested=new Set(String(categoryArgument).split(',').map(value=>value.trim()).filter(Boolean));
const tests=requested.size?allTests.filter(([category])=>requested.has(category)):allTests;
if(!tests.length)throw new Error('No matching Phase 5 test categories.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const signed=await client.auth.signInAnonymously();if(signed.error||!signed.data.session)throw signed.error??new Error('Anonymous test sign-in failed.');
const session=signed.data.session,installationId=randomUUID(),token=randomBytes(32).toString('hex');
const registered=await client.rpc('register_installation',{p_id:installationId,p_token:token,p_platform:'web',p_app_version:'phase5-test'});if(registered.error)throw registered.error;
const db=await connectDatabase();
const results=[];const startedAt=new Date().toISOString();
try{
 await db.query(`insert into public.recommendation_test_access(installation_id,label,active,expires_at,rate_limit_per_minute,rate_limit_per_day)
   values($1,'Automated Phase 5 real-world suite',true,now()+interval '1 day',30,100)`,[installationId]);
 for(const [category,situation] of tests){
  const requestId=randomUUID(),started=Date.now();
  const response=await fetch(`${url}/functions/v1/recommend`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({requestId,installationId,installationToken:token,situation})});
  const payload=await response.json();if(!response.ok)throw new Error(`Recommendation failed (${response.status} ${payload.error??'unknown'})`);
  const run=(await db.query('select retrieved_candidates,confidence,estimated_cost_usd,model_snapshot from public.recommendation_runs where id=$1',[requestId])).rows[0];
  results.push({category,input:situation,recommendation:payload.song?.title,artists:payload.song?.artists,explanation:payload.explanation,confidence:payload.confidence,topRetrieved:(run?.retrieved_candidates??[]).slice(0,5),estimatedCostUsd:Number(run?.estimated_cost_usd??0),modelSnapshot:run?.model_snapshot,durationMs:Date.now()-started});
  console.log(`${results.length}/${tests.length} ${category}: ${payload.song?.title}`);
 }
}finally{
 await db.query('update public.recommendation_test_access set active=false where installation_id=$1',[installationId]).catch(()=>{});
 const totals=(await db.query(`select count(*)::int completed,coalesce(sum(embedding_input_tokens),0)::int embedding_input_tokens,
   coalesce(sum(reranking_input_tokens),0)::int reranking_input_tokens,coalesce(sum(reranking_cached_input_tokens),0)::int cached_input_tokens,
   coalesce(sum(reranking_output_tokens),0)::int output_tokens,coalesce(sum(estimated_cost_usd),0)::numeric total_cost
   from public.recommendation_runs where installation_id=$1 and status='completed'`,[installationId])).rows[0];
 const report={startedAt,completedAt:new Date().toISOString(),path:'deployed authenticated recommendation Edge Function',testCount:tests.length,totals,results};
 const reportName=requested.size?'phase5-targeted-report.json':'phase5-real-world-report.json';
 await mkdir(new URL('../artifacts/recommendations/',import.meta.url),{recursive:true});await writeFile(new URL(`../artifacts/recommendations/${reportName}`,import.meta.url),JSON.stringify(report,null,2));
 await db.end();
}
