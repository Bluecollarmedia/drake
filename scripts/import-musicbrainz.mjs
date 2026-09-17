import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
import { buildPlan } from '../server/catalog/musicbrainz-plan.mjs';
import { persistMusicBrainzPlan } from '../server/catalog/musicbrainz-store.mjs';
import { DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
if(!process.argv.includes('--plan-only')){
  console.error('MusicBrainz-driven membership import is paused. Use curated master-list import; metadata discovery must not add canonical songs.');
  process.exit(1);
}
const root=new URL('../artifacts/musicbrainz/',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8').then(JSON.parse);
let client;let runId;
try {
  const raw=await read('recordings.json');const releases=await read('releases.json');const excluded=await read('excluded-releases.json');const errors=await read('release-fetch-errors.json');
  if(errors.length)throw new Error('musicbrainz_release_fetch_incomplete');
  let performance=[];try{performance=await read('performance-review.json');}catch(error){if(error.code!=='ENOENT')throw error;}
  const plan=buildPlan(raw,releases,excluded,performance);
  const missing=plan.completeness.filter(t=>!t.passed);
  const preview={counts:plan.counts,completeness:plan.completeness,metadataWarnings:plan.metadataWarnings};
  await writeFile(new URL('plan-summary.json',root),JSON.stringify(preview,null,2));
  console.log(JSON.stringify(preview,null,2));
  if(process.argv.includes('--plan-only'))process.exit(0);
  if(missing.length&&!process.argv.includes('--allow-documented-gaps'))throw new Error('completeness_investigation_required_before_import');
  client=await connectDatabase();runId=randomUUID();
  const coverage={source:'MusicBrainz /ws/2 JSON',artistId:DRAKE_MBID,releaseStatuses:['Official','Withdrawn (previously officially released)'],discovery:['recording artist-credit browse','release track_artist browse','paginated official recording search with indexed release/track appearances','cached full track-credit listings and full lookups for index-absent releases','full lookups of historical withdrawn official releases'],snapshotHash:createHash('sha256').update(JSON.stringify({raw,releases,excluded})).digest('hex'),noAI:true};
  await client.query("insert into public.catalog_imports(id,provider,coverage) values($1,'musicbrainz',$2)",[runId,JSON.stringify(coverage)]);
  const persisted=await persistMusicBrainzPlan(client,plan);
  const {rows:counts}=await client.query(`select
    (select count(*)::int from public.songs where catalog_type='official_released') canonical_songs,
    (select count(*)::int from public.release_tracks) appearances,
    (select count(*)::int from public.releases) releases,
    (select count(*)::int from public.song_provider_ids where provider='musicbrainz') recording_ids,
    (select count(*)::int from public.song_analysis_profiles) analysis_profiles,
    (select count(*)::int from public.song_embeddings) embeddings,
    (select count(*)::int from public.song_scenarios) scenarios,
    (select count(*)::int from public.analysis_jobs) analysis_jobs`);
  if(counts[0].canonical_songs!==plan.clusters.length||counts[0].appearances!==plan.appearances.length||counts[0].recording_ids!==plan.recordings.size)throw new Error('persisted_catalog_counts_do_not_match_plan');
  if(['analysis_profiles','embeddings','scenarios','analysis_jobs'].some(k=>counts[0][k]!==0))throw new Error('unexpected_analysis_data');
  const {rows:databaseCompleteness}=await client.query(`select q.title,count(s.id)::int matches from jsonb_to_recordset($1) as q(title text,normalized text) left join public.songs s on s.catalog_type='official_released' and (s.normalized_title=q.normalized or (q.normalized='i get lonely' and s.normalized_title='i get lonely too')) group by q.title`,[JSON.stringify(plan.completeness.map(t=>({title:t.title,normalized:t.title.toLowerCase()})))]);
  if(databaseCompleteness.some(t=>t.matches===0))throw new Error('persisted_completeness_test_failed');
  const {rows:songs}=await client.query(`select s.id,s.title,s.normalized_title,s.version_key,s.duration_ms,s.source_metadata->'drakeCreditRoles' drake_roles,
    (select jsonb_agg(jsonb_build_object('name',a.name,'role',c.role) order by c.credit_order) from public.song_artists c join public.artists a on a.id=c.artist_id where c.song_id=s.id) artists,
    (select count(*)::int from public.release_tracks t where t.song_id=s.id) appearances,
    (select jsonb_agg(jsonb_build_object('id',p.provider_id,'url',p.url)) from public.song_provider_ids p where p.song_id=s.id and p.provider='musicbrainz') musicbrainz_recordings
    from public.songs s where s.catalog_type='official_released' order by lower(s.title),s.id`);
  const {rows:reviews}=await client.query(`select d.id,d.song_a_id,a.title title_a,a.duration_ms duration_a,a.version_key version_a,d.song_b_id,b.title title_b,b.duration_ms duration_b,b.version_key version_b,d.evidence,
    array(select isrc from public.song_recording_codes where song_id=a.id) isrcs_a,array(select isrc from public.song_recording_codes where song_id=b.id) isrcs_b
    from public.duplicate_reviews d join public.songs a on a.id=d.song_a_id join public.songs b on b.id=d.song_b_id where d.status='pending' order by lower(a.title),lower(b.title),d.id`);
  const primary=songs.filter(s=>s.drake_roles.includes('primary'));const feature=songs.filter(s=>!s.drake_roles.includes('primary')&&s.drake_roles.includes('featured'));const ambiguous=songs.filter(s=>s.drake_roles.length>1);
  const representative=keys=>songs.filter(s=>keys.includes(s.id)).sort((a,b)=>b.appearances-a.appearances)[0];
  const required=plan.completeness.map(t=>representative(t.canonicalKeys.map(k=>persisted.canonicalIds[k]))).filter(Boolean);
  const uniqueTitles=values=>[...new Map(values.map(s=>[s.normalized_title,s])).values()];
  const samples=uniqueTitles([...songs.filter(s=>s.version_key==='original').reverse(),...required]).sort((a,b)=>Number(required.includes(b))-Number(required.includes(a))||a.title.localeCompare(b.title)).slice(0,25);
  const featureSamples=uniqueTitles(feature.filter(s=>s.version_key==='original').sort((a,b)=>a.appearances-b.appearances)).slice(0,15);
  const {rows:multipleReleaseExamples}=await client.query(`select s.id,s.title,count(*)::int appearance_count,jsonb_agg(jsonb_build_object('release_id',r.id,'title',r.title,'track',t.track_number,'disc',t.disc_number,'musicbrainz_id',p.provider_id) order by r.title) appearances from public.songs s join public.release_tracks t on t.song_id=s.id join public.releases r on r.id=t.release_id join public.release_provider_ids p on p.release_id=r.id and p.provider='musicbrainz' group by s.id having count(*)>1 order by count(*) desc limit 5`);
  const report={runId,createdAt:new Date().toISOString(),coverage,discoveryCounts:plan.counts,databaseCounts:counts[0],primaryOrJointPrimarySongs:primary.length,featuredSongs:feature.length,ambiguousPrimaryFeatureCreditSongs:ambiguous.length,
    ...persisted,canonicalIds:undefined,uncertainDuplicatePairs:reviews.length,completeness:plan.completeness,databaseCompleteness,sampleCanonicalSongs:samples,featureSamples,multipleReleaseExamples,allUncertainDuplicates:reviews,metadataWarnings:plan.metadataWarnings,
    performanceMetadataReview:performance,exclusions:{releases:plan.excludedReleases,trackAppearances:plan.excludedTracks,rawRecordings:plan.excludedRecordings},
    limitations:['MusicBrainz is community-maintained: Official status is metadata evidence, not independent proof of rights or artist authorization.','Track-credit browse covers entries represented in MusicBrainz; absent or incorrectly credited releases remain gaps.','Indexed appearances preserve the recording performing credit when the index omits the specific track credit; full listings preserve the actual track credit. Indexed search may cap appearances per recording or lag edits. The report distinguishes full and targeted listings.','Bootlegs, unknown/Promotion statuses, pseudo-releases and continuous DJ mixes are excluded conservatively. Promotion can include pre-release versions, so promo-only material needs release/authorization review; previously released Withdrawn entries remain eligible.','Performing-credit metadata can reflect release branding on guest interludes. Targeted vocal-relationship checks hold contradictory cases for review; missing relationships do not establish complete performance credits. Instrumentals without Drake vocal evidence are excluded.','Official remixes/live/alternate versions remain distinct; uncertain recording identities remain separate until reviewed.','No lyrics, AI profiles, scenarios, embeddings, recommendation calls or analysis jobs were created.','No Spotify or Apple Music links are invented; MusicBrainz evidence URLs are stored in their separate namespace.']};
  await mkdir(new URL('reports/',root),{recursive:true});
  await writeFile(new URL(`reports/${runId}.json`,root),JSON.stringify(report,null,2));
  await writeFile(new URL('latest-report.json',root),JSON.stringify(report,null,2));
  await client.query("update public.catalog_imports set status=$2,completed_at=now(),report=$3 where id=$1",[runId,missing.length?'partial':'completed',JSON.stringify(report)]);
  console.log(JSON.stringify({runId,databaseCounts:counts[0],newSongs:persisted.newSongs,newReleases:persisted.newReleases,primaryOrJoint:primary.length,featured:feature.length,uncertainPairs:reviews.length,missingCompleteness:missing.map(t=>t.title)},null,2));
}catch(error){if(client&&runId)await client.query("update public.catalog_imports set status='failed',completed_at=now(),report=$2 where id=$1",[runId,JSON.stringify({error:error.message})]).catch(()=>{});console.error(`MusicBrainz import failed: ${error.message}`);process.exitCode=1;}
finally{await client?.end();}
