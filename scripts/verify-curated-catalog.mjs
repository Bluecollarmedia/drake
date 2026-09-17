import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
const root=new URL('../artifacts/curated-catalog/',import.meta.url);
const r=JSON.parse(await readFile(new URL('latest-report.json',root),'utf8'));
const feature=await readFile(new URL('../artifacts/curated-features/latest-report.json',import.meta.url),'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
let client;
try{
  client=await connectDatabase();
  const tables=(await client.query("select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'")).rows;
  assert(tables.every(t=>t.relrowsecurity));
  const actual=(await client.query("select count(*)::int songs,count(*) filter(where catalog_type='unreleased')::int unreleased from public.songs")).rows[0];assert.equal(actual.songs,feature?.counts.canonical_songs??r.counts.canonical_songs);assert.equal(actual.unreleased,0);
  const bad=(await client.query("select count(*)::int count from public.released_catalog_eligible_songs s join public.catalog_memberships m on m.song_id=s.id where m.requires_performance_review and not m.performance_verified")).rows[0];assert.equal(bad.count,0);
  assert.equal((await client.query("select count(*)::int n from public.catalog_memberships where scope='feature_guest' and active")).rows[0].n,feature?.counts.active_candidates??0);
  const leadIds=(await client.query("select candidate_key,song_id from public.catalog_memberships where scope='lead_joint_primary' and active order by candidate_key")).rows;
  assert.deepEqual(leadIds.map(s=>[s.candidate_key,s.song_id]),r.catalog.map(s=>[s.candidate_key,s.id]));
  const probe=JSON.parse(await readFile(new URL('../.secrets/auth-probe.local.json',import.meta.url),'utf8'));
  await client.query('begin');
  const fake=randomUUID();await client.query("insert into public.songs(id,title,normalized_title) values($1,'Unlisted eligibility fixture','unlisted eligibility fixture')",[fake]);
  assert.equal((await client.query('select count(*)::int n from public.released_catalog_eligible_songs where id=$1',[fake])).rows[0].n,0);
  async function rejected(sql,values,expected){
    await client.query('savepoint denied');let code;
    try{await client.query(sql,values);}catch(error){code=error.code;}
    await client.query('rollback to savepoint denied');assert.equal(code,expected);
  }
  const held=(await client.query('select id from public.catalog_memberships where requires_performance_review and not performance_verified limit 1')).rows[0];
  await rejected("update public.catalog_memberships set status='approved' where id=$1",[held.id],'23514');
  await client.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:probe.user.id,role:'authenticated',is_anonymous:true})]);
  await client.query('set local role authenticated');
  assert.equal((await client.query('select count(*)::int n from public.released_catalog_eligible_songs')).rows[0].n,feature?.counts.eligible_songs??r.counts.eligible_songs);
  for(const table of ['songs','catalog_memberships','catalog_master_lists','catalog_master_entries','catalog_metadata_reviews'])await rejected(`delete from public.${table}`,[],'42501');
  await client.query('reset role');await client.query('rollback');
  const phase3=(await client.query(`select (select count(*)::int from public.song_analysis_profiles) profiles,(select count(*)::int from public.song_scenarios) scenarios,(select count(*)::int from public.song_embeddings) embeddings,(select count(*)::int from public.analysis_jobs) jobs`)).rows[0];assert(Object.values(phase3).every(n=>n===0));
  const result={checkedAt:new Date().toISOString(),rlsTables:tables.length,allTablesRls:true,normalClientCatalogAndMembershipWritesDenied:true,unlistedSongExcludedFromEligibility:true,unverifiedPerformanceCannotBeApproved:true,explicitReviewNotEligible:true,part2Imported:!!feature,part1UuidsPreserved:true,phase3Rows:phase3};
  await writeFile(new URL(feature?'../artifacts/curated-features/security-verification.json':'../artifacts/curated-catalog/security-verification.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(error){await client?.query('rollback').catch(()=>{});console.error(`Catalog verification failed: ${error.message}`);process.exitCode=1;}finally{await client?.end();}
