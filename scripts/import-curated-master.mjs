import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { connectDatabase } from './lib/database.mjs';
import { persistCuratedPlan } from '../server/catalog/curated-store.mjs';
const root=new URL('../artifacts/curated-catalog/',import.meta.url);
const plan=JSON.parse(await readFile(new URL('enriched-plan.json',root),'utf8'));
const raw=await readFile(new URL('../server/catalog/curated/drake-lead-master.txt',import.meta.url),'utf8');
assert.equal(createHash('sha256').update(raw).digest('hex'),plan.master.hash,'Plan must match the current supplied master list');
let client;
try{
  client=await connectDatabase();
  const result=await persistCuratedPlan(client,plan);
  const counts=(await client.query(`select
    (select count(*)::int from public.songs) canonical_songs,
    (select count(*)::int from public.catalog_master_entries where master_list_id=$1) master_entries,
    (select count(*)::int from public.catalog_memberships where scope='lead_joint_primary' and active) active_candidates,
    (select count(*)::int from public.released_catalog_eligible_songs) eligible_songs,
    (select count(*)::int from public.catalog_memberships where scope='lead_joint_primary' and active and status='needs_review') held_candidates,
    (select count(*)::int from public.releases) releases,
    (select count(*)::int from public.release_tracks) appearances,
    (select count(*)::int from public.song_provider_ids where provider='musicbrainz') musicbrainz_recording_ids,
    (select count(*)::int from public.song_analysis_profiles) analysis_profiles,
    (select count(*)::int from public.song_scenarios) scenarios,
    (select count(*)::int from public.song_embeddings) embeddings,
    (select count(*)::int from public.analysis_jobs) analysis_jobs`,[result.masterListId])).rows[0];
  assert.equal(counts.master_entries,plan.master.entries.length);assert.equal(counts.active_candidates,plan.master.candidates.length);
  const scoped=(await client.query(`select
    (select count(*)::int from public.release_tracks t where exists(select 1 from public.catalog_memberships m where m.song_id=t.song_id and m.scope='lead_joint_primary' and m.active)) appearances,
    (select count(*)::int from public.song_provider_ids p where p.provider='musicbrainz' and exists(select 1 from public.catalog_memberships m where m.song_id=p.song_id and m.scope='lead_joint_primary' and m.active)) recordings`)).rows[0];
  assert.equal(scoped.appearances,result.appearances);assert.equal(scoped.recordings,plan.counts.recordingIds);
  assert(['analysis_profiles','scenarios','embeddings','analysis_jobs'].every(k=>counts[k]===0));
  const catalog=(await client.query(`select m.candidate_key,s.id,s.title,s.version_key,s.duration_ms,m.supplied_roles,m.status,m.requires_performance_review,m.performance_verified,s.source_metadata->>'officialTitle' official_title,
    (select jsonb_agg(jsonb_build_object('name',a.name,'role',c.role) order by c.credit_order) from public.song_artists c join public.artists a on a.id=c.artist_id where c.song_id=s.id) artists,
    (select jsonb_agg(isrc) from public.song_recording_codes where song_id=s.id) isrcs,
    (select count(*)::int from public.release_tracks where song_id=s.id) appearances,
    (select min(r.release_date) from public.release_tracks t join public.releases r on r.id=t.release_id where t.song_id=s.id) earliest_source_release_date,
    (select count(*)::int from public.release_tracks t join public.releases r on r.id=t.release_id where t.song_id=s.id and r.artwork<>'[]'::jsonb) artwork_appearances
    from public.catalog_memberships m join public.songs s on s.id=m.song_id where m.active and m.scope='lead_joint_primary' order by m.candidate_key`)).rows;
  const entries=(await client.query('select ordinal,song_id,raw_entry,supplied_title,supplied_credit,supplied_role,supplied_version,project from public.catalog_master_entries where master_list_id=$1 order by ordinal',[result.masterListId])).rows;
  for(const e of plan.master.entries){const saved=entries[e.ordinal-1];assert.equal(saved.raw_entry,e.raw);assert.equal(saved.supplied_role,e.role);assert.equal(saved.supplied_credit,e.credit);assert.equal(saved.song_id,result.candidateIds[e.candidateKey]);}
  for(const c of plan.enriched.filter(c=>c.explicitlyReview)){const saved=catalog.find(s=>s.candidate_key===c.key);assert.equal(saved.status,'needs_review');assert.equal(saved.performance_verified,false);}
  const report={createdAt:new Date().toISOString(),source:'User-supplied curated master list, Part 1: lead/joint-primary',masterHash:plan.master.hash,...result,counts,parsedCounts:plan.master.counts,enrichmentCounts:plan.counts,
    exactRepeatedText:plan.master.exactRepeatedText,catalog,entries,
    allReviews:plan.enriched.filter(c=>c.reviews.length).map(c=>({songId:result.candidateIds[c.key],candidateKey:c.key,title:c.title,roles:c.roles,projects:c.entries.map(e=>e.project),status:c.status,sourceTitle:c.best?.title||null,reviews:c.reviews})),
    canonicalUuidFingerprint:createHash('sha256').update(JSON.stringify(catalog.map(s=>[s.candidate_key,s.id]))).digest('hex'),
    coverage:{metadataSource:'Previously cached MusicBrainz /ws/2 responses plus four targeted full-project lookups; no new artist-wide discovery',membershipSource:'curated list only',part2Imported:false,noLyrics:true,noAI:true,
      limitations:['Curated membership is not expanded by MusicBrainz; missing or disagreeing metadata does not delete a candidate.','Source titles and source credits are retained separately from supplied titles, credits and roles. Source conflicts need review.','Only matched, compatible recording identities get provider IDs/appearances; uncertain identities remain proposals linked to the same candidate for review, not additional songs.','List positions are not asserted as official track numbers; only source tracklists provide those.','MusicBrainz Official status and credits are community metadata, not independent rights or complete vocal-performance proof.','Targeted indexed appearances may be incomplete or lag edits; actual full track-credit listings and recording-credit fallbacks are labeled separately.','Artwork references exist only when source metadata confirms Cover Art Archive artwork. Missing Spotify/Apple identifiers and links are not fabricated.','Source release dates describe verified appearances and are not necessarily the first-ever release date of the underlying song. Supplied project years remain claims until matched.','Review entries and blocking discrepancies stay excluded from the future eligible-catalog view until reviewed. The recommendation engine itself is not implemented.','Part 2 features/guests is not supplied or imported; this is not the entire final Drake recommendation catalog.']}};
  await mkdir(new URL('runs/',root),{recursive:true});
  await writeFile(new URL(`runs/${Date.now()}.json`,root),JSON.stringify(report,null,2));
  await writeFile(new URL('latest-report.json',root),JSON.stringify(report,null,2));
  console.log(JSON.stringify({counts,newSongs:result.newSongs,newReleases:result.newReleases,canonicalUuidFingerprint:report.canonicalUuidFingerprint,sourceEntriesVerified:entries.length},null,2));
}catch(error){console.error(`Curated import failed: ${error.message}`);process.exitCode=1;}finally{await client?.end();}
