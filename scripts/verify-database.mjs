import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { connectDatabase } from './lib/database.mjs';
let client;
try {
  client = await connectDatabase();
  const session = JSON.parse(await readFile(new URL('../.secrets/auth-probe.local.json', import.meta.url), 'utf8'));
  const { rows: tables } = await client.query("select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'");
  assert(tables.length >= 20);
  assert(tables.every(table => table.relrowsecurity), 'Every application table must enable RLS');
  const { rows: extensions } = await client.query("select extname from pg_extension where extname in ('vector','pgcrypto')");
  assert.equal(extensions.length, 2);
  const { rows: privileges } = await client.query("select has_table_privilege('authenticated','public.songs','INSERT') catalog_insert, has_table_privilege('authenticated','public.usage_events','INSERT') usage_insert, has_table_privilege('authenticated','public.entitlements','INSERT') entitlement_insert, has_table_privilege('anon','public.songs','SELECT') public_catalog_read");
  assert(Object.values(privileges[0]).every(value => value === false));
  await client.query('begin');
  const installation = randomUUID(); const token = randomBytes(32).toString('hex');
  const fakeSong = randomUUID(); const request = randomUUID();
  await client.query('insert into public.songs(id,title,normalized_title) values($1,$2,$3)', [fakeSong,'Transactional security fixture','transactional security fixture']);
  await client.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: session.user.id, role: 'authenticated', is_anonymous: true })]);
  await client.query('set local role authenticated');
  await client.query('select public.register_installation($1,$2,$3,$4)', [installation,token,'ios','phase2-test']);
  // Retry must return the same installation; no new anonymous allowance identity.
  await client.query('select public.register_installation($1,$2,$3,$4)', [installation,token,'ios','phase2-test']);
  await client.query('update public.profiles set preferred_music_service=$1 where id=$2',['apple',session.user.id]);
  const { rows: status } = await client.query('select public.get_usage_status($1,$2) result',[installation,token]);
  assert.equal(status[0].result.enabled,false); assert.equal(status[0].result.used,0);
  async function denied(sql, values = []) {
    await client.query('savepoint denied_write');
    let code;
    try { await client.query(sql,values); } catch (error) { code=error.code; }
    await client.query('rollback to savepoint denied_write');
    assert.equal(code,'42501',`Expected permission rejection: ${sql}`);
  }
  await denied('insert into public.songs(title,normalized_title) values($1,$2)',['forbidden','forbidden']);
  await denied('update public.entitlements set status=$1',['active']);
  await denied('insert into public.usage_events(installation_id,event_type,request_id,status) values($1,$2,$3,$4)',[installation,'recommendation',request,'completed']);
  await denied('select public.register_installation($1,$2,$3,$4)',[installation,'0'.repeat(64),'ios','test']);
  await denied('insert into public.saved_recommendations(user_id,song_id,recommendation_explanation) values($1,$2,$3)',[session.user.id,fakeSong,'fixture']);
  await denied("select * from public.claim_analysis_job('profile')");
  await client.query('reset role');
  await client.query("insert into public.usage_events(installation_id,user_id,event_type,request_id,status) values($1,$2,'recommendation',$3,'completed')",[installation,session.user.id,request]);
  await client.query("insert into public.analysis_jobs(song_id,job_type,analysis_version) values($1,'profile','test')",[fakeSong]);
  const {rows: jobs} = await client.query("select * from public.claim_analysis_job('profile',300,'test')");
  assert.equal(jobs.length,1); assert.equal(jobs[0].attempt_count,1);
  assert.equal((await client.query("select public.finish_analysis_job($1,$2,'completed') result",[jobs[0].id,randomUUID()])).rows[0].result,false);
  assert.equal((await client.query("select public.finish_analysis_job($1,$2,'completed') result",[jobs[0].id,jobs[0].lease_token])).rows[0].result,true);
  await client.query("update public.analysis_jobs set status='processing',lease_expires_at=now()-interval '1 minute',attempt_count=max_attempts where id=$1",[jobs[0].id]);
  await client.query("select * from public.claim_analysis_job('profile',300,'test')");
  assert.equal((await client.query('select status from public.analysis_jobs where id=$1',[jobs[0].id])).rows[0].status,'failed');
  // Architecture test only: provider verification is NOT simulated as a real OAuth success.
  await client.query('update auth.users set is_anonymous=false where id=$1',[session.user.id]);
  await client.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:session.user.id,role:'authenticated',is_anonymous:false})]);
  await client.query('set local role authenticated');
  await client.query('select public.register_installation($1,$2,$3,$4)',[installation,token,'ios','test']);
  const linkedStatus = (await client.query('select public.get_usage_status($1,$2) result',[installation,token])).rows[0].result;
  assert.equal(linkedStatus.used,1,'Upgrading the account must preserve installation usage');
  await client.query('insert into public.saved_recommendations(user_id,song_id,recommendation_explanation) values($1,$2,$3)',[session.user.id,fakeSong,'fixture']);
  await client.query('reset role');
  assert.equal((await client.query('select user_id from public.installations where id=$1',[installation])).rows[0].user_id,session.user.id);
  assert.equal(Number((await client.query('select count(*) from public.installations where id=$1',[installation])).rows[0].count),1);
  await client.query('rollback');
  const {rows: counts}=await client.query('select (select count(*) from public.songs) songs,(select count(*) from public.song_analysis_profiles) profiles,(select count(*) from public.song_embeddings) embeddings,(select count(*) from public.analysis_jobs) jobs');
  console.log(JSON.stringify({rls_tables_verified:tables.length,pgvector_enabled:true,privileged_client_writes_denied:true,installation_registration_idempotent:true,wrong_installation_token_denied:true,anonymous_save_denied:true,upgrade_preserves_usage_architecture_verified:true,analysis_job_leases_verified:true,live_counts:counts[0],fixtures:'All security fixtures rolled back; no catalog or AI analysis data was seeded.'},null,2));
} catch(error) {
  await client?.query('rollback').catch(()=>{});
  console.error(`Database verification failed (${error.code ?? error.message}).`);
  process.exitCode=1;
} finally { await client?.end(); }
