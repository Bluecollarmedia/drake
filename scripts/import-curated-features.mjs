import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { connectDatabase } from './lib/database.mjs';
import { persistCuratedPlan } from '../server/catalog/curated-store.mjs';
const root=new URL('../artifacts/curated-features/',import.meta.url);
const plan=JSON.parse(await readFile(new URL('enriched-plan.json',root),'utf8'));
const raw=await readFile(new URL('../server/catalog/curated/drake-feature-master.txt',import.meta.url),'utf8');
assert.equal(createHash('sha256').update(raw).digest('hex'),plan.master.hash);
assert.equal(plan.master.scope,'feature_guest');
const apply=process.argv.includes('--apply');
let client;
const snapshot=async()=> (await client.query(`select m.candidate_key,m.song_id,to_jsonb(s) song,to_jsonb(m) membership,
  (select jsonb_agg(to_jsonb(a) order by a.artist_id) from public.song_artists a where a.song_id=s.id) artists
  from public.catalog_memberships m join public.songs s on s.id=m.song_id where m.scope='lead_joint_primary' order by m.candidate_key`)).rows;
const counts=async()=> (await client.query(`select (select count(*)::int from public.songs) canonical_songs,
 (select count(*)::int from public.releases) releases,(select count(*)::int from public.release_tracks) appearances,
 (select count(*)::int from public.released_catalog_eligible_songs) eligible_songs,
 (select count(*)::int from public.catalog_memberships where scope='feature_guest' and active) active_candidates,
 (select count(*)::int from public.catalog_memberships where scope='feature_guest' and active and status='needs_review') held_candidates,
 (select count(*)::int from public.song_provider_ids where provider='musicbrainz') recording_ids,
 (select count(*)::int from public.song_analysis_profiles) profiles,(select count(*)::int from public.song_scenarios) scenarios,
 (select count(*)::int from public.song_embeddings) embeddings,(select count(*)::int from public.analysis_jobs) jobs`)).rows[0];
try{
 client=await connectDatabase();
 const before=await snapshot(),previousCounts=await counts();
 const providerRows=(await client.query("select p.provider_id,p.song_id,m.scope,s.title from public.song_provider_ids p join public.songs s on s.id=p.song_id join public.catalog_memberships m on m.song_id=s.id where p.provider='musicbrainz' and m.scope='lead_joint_primary' and m.active")).rows;
 const overlap=plan.enriched.flatMap(c=>{const hits=providerRows.filter(p=>c.recordingIds.includes(p.provider_id));return hits.length?[{candidate:c.key,title:c.title,part1Songs:[...new Set(hits.map(p=>p.song_id))]}]:[];});
 // Cross-scope matches keep their existing UUID; conflicts are audited rather than title-merged.
 for(const c of plan.enriched){const hits=providerRows.filter(p=>c.recordingIds.includes(p.provider_id));if(hits.length&&!c.reviews.some(r=>r.reason==='overlaps_part1_billing_requires_review')){
   c.status='needs_review';c.reviews.push({reason:'overlaps_part1_billing_requires_review',blocking:true,evidence:{existingSongs:hits,suppliedRole:c.roles}});
 }}
 console.log(JSON.stringify({audit:{entries:plan.master.entries.length,candidates:plan.enriched.length,part1Overlaps:overlap,nameCollisions:plan.nameCollisions,duplicates:plan.master.counts.repeatedCanonicalEntries,enriched:plan.counts.enrichedCandidates,held:plan.enriched.filter(c=>c.status==='needs_review').length},mode:apply?'apply':'transactional rehearsal'}));
 let target=client;
 if(!apply){
  await client.query('begin');
  target=new Proxy(client,{get(t,p){if(p==='query')return async(sql,values)=>{
   if(sql==='begin')return client.query('savepoint feature_fixture');
   if(sql==='commit')return client.query('release savepoint feature_fixture');
   if(sql==='rollback'){await client.query('rollback to savepoint feature_fixture');return client.query('release savepoint feature_fixture');}
   return client.query(sql,values);
  };return Reflect.get(t,p);}});
 }
 const result=await persistCuratedPlan(target,plan);
 assert.deepEqual(await snapshot(),before,'Part 1 records, memberships, credits and UUIDs must remain unchanged');
 const afterCounts=await counts();
 assert.equal(afterCounts.canonical_songs,previousCounts.canonical_songs+result.newSongs);
 assert.equal(afterCounts.active_candidates,plan.master.candidates.length);
 assert(['profiles','scenarios','embeddings','jobs'].every(k=>afterCounts[k]===0));
 const catalog=(await client.query(`select m.candidate_key,m.song_id,s.title,s.version_key,m.supplied_roles,m.status,m.requires_performance_review,m.performance_verified,m.metadata_summary,m.review_reasons,
  (select jsonb_agg(jsonb_build_object('name',a.name,'role',c.role) order by c.credit_order) from public.song_artists c join public.artists a on a.id=c.artist_id where c.song_id=s.id) artists,
  (select count(*)::int from public.release_tracks t where t.song_id=s.id) appearances,
  (select min(r.release_date) from public.release_tracks t join public.releases r on r.id=t.release_id where t.song_id=s.id) earliest_source_date,
  (select jsonb_agg(isrc) from public.song_recording_codes where song_id=s.id) isrcs
  from public.catalog_memberships m join public.songs s on s.id=m.song_id where m.scope='feature_guest' and m.active order by m.candidate_key`)).rows;
 const entries=(await client.query('select * from public.catalog_master_entries where master_list_id=$1 order by ordinal',[result.masterListId])).rows;
 assert.equal(entries.length,96);
 for(const e of plan.master.entries){const saved=entries[e.ordinal-1];assert.equal(saved.raw_entry,e.raw);assert.equal(saved.supplied_primary_artist,e.primary);assert.equal(saved.supplied_credit,e.credit);assert.equal(saved.supplied_role,e.role);assert.equal(saved.song_id,result.candidateIds[e.candidateKey]);}
 for(const c of plan.enriched.filter(c=>c.explicitlyReview)){const saved=catalog.find(s=>s.candidate_key===c.key);assert.equal(saved.status,'needs_review');assert.equal(saved.performance_verified,false);}
 const fingerprint=createHash('sha256').update(JSON.stringify(catalog.map(c=>[c.candidate_key,c.song_id]))).digest('hex');
 const report={createdAt:new Date().toISOString(),masterHash:plan.master.hash,parsedCounts:plan.master.counts,enrichmentCounts:plan.counts,overlap,nameCollisions:plan.nameCollisions,previousCounts,counts:afterCounts,...result,catalog,entries,fingerprint,part1Unchanged:true,noAI:true};
 if(!apply){
  const repeat=await persistCuratedPlan(target,plan);
  assert.equal(repeat.newSongs,0);assert.equal(repeat.newReleases,0);assert.deepEqual(repeat.candidateIds,result.candidateIds);
  assert.deepEqual(await counts(),afterCounts);assert.deepEqual(await snapshot(),before);
  await client.query('rollback');assert.deepEqual(await counts(),previousCounts);
  await writeFile(new URL('rehearsal-verification.json',root),JSON.stringify({checkedAt:new Date().toISOString(),allFixturesRolledBack:true,realPersistenceSqlTested:true,idempotent:true,part1Unchanged:true,projectedCounts:afterCounts},null,2));
 }else{
  const previous=await readFile(new URL('latest-report.json',root),'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if(previous&&previous.masterHash===plan.master.hash){assert.equal(result.newSongs,0);assert.equal(result.newReleases,0);assert.equal(previous.fingerprint,fingerprint);assert.deepEqual(previous.counts,afterCounts);await writeFile(new URL('idempotence-verification.json',root),JSON.stringify({checkedAt:new Date().toISOString(),newSongs:0,newReleases:0,stableCandidateUuids:true,stableCounts:true,part1Unchanged:true,fingerprint},null,2));}
  await mkdir(new URL('runs/',root),{recursive:true});await writeFile(new URL('runs/'+Date.now()+'.json',root),JSON.stringify(report,null,2));await writeFile(new URL('latest-report.json',root),JSON.stringify(report,null,2));
 }
 console.log(JSON.stringify({applied:apply,newSongs:result.newSongs,newReleases:result.newReleases,counts:afterCounts,part1Unchanged:true,fingerprint},null,2));
}catch(error){await client?.query('rollback').catch(()=>{});console.error('Feature import failed: '+error.message);process.exitCode=1;}finally{await client?.end();}
