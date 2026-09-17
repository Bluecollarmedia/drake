import { randomUUID } from 'node:crypto';
import { normalized, songTitle } from './musicbrainz-identity.mjs';
import { releaseMetadata } from './musicbrainz-plan.mjs';
import { DRAKE_MBID } from './musicbrainz-client.mjs';

const payload = value => JSON.stringify(value);
export async function persistMusicBrainzPlan(client, plan) {
  await client.query('begin');
  try {
    await client.query("select pg_advisory_xact_lock(hashtext('which-drake.catalog'))");
    const {rows:previous} = await client.query("select provider_id,song_id from public.song_provider_ids where provider='musicbrainz'");
    const previousMap = new Map(previous.map(r => [r.provider_id,r.song_id]));
    const {rows:previousArtists} = await client.query("select provider_id,artist_id from public.artist_provider_ids where provider='musicbrainz'");
    const artistMap = new Map(previousArtists.map(r => [r.provider_id,r.artist_id]));
    const {rows:subject} = await client.query("select artist_id from public.catalog_subjects where slug='drake'");
    if (subject[0]) artistMap.set(DRAKE_MBID,subject[0].artist_id);
    const artists = new Map();
    const addArtists = values => { for (const artist of values) { if (!artistMap.has(artist.id)) artistMap.set(artist.id,randomUUID()); artists.set(artist.id,{id:artistMap.get(artist.id),external:artist.id,name:artist.name,normalized:normalized(artist.name)}); } };
    for (const recording of plan.recordings.values()) addArtists(recording.artists);
    const usedReleaseIds = new Set(plan.appearances.map(a => a.releaseId));
    for (const release of plan.releases.filter(r => usedReleaseIds.has(r.id))) addArtists((release['artist-credit'] || []).filter(c => c.artist?.id).map(c => ({id:c.artist.id,name:c.artist.name || c.name})));
    await client.query(`insert into public.artists(id,name,normalized_name) select id,name,normalized from jsonb_to_recordset($1) as x(id uuid,name text,normalized text) on conflict(id) do nothing`,[payload([...artists.values()])]);
    await client.query(`insert into public.artist_provider_ids(provider,provider_id,artist_id,url) select 'musicbrainz',external,id,'https://musicbrainz.org/artist/'||external from jsonb_to_recordset($1) as x(id uuid,external text) on conflict(provider,provider_id) do nothing`,[payload([...artists.values()])]);
    await client.query("insert into public.catalog_subjects(slug,artist_id,source_notes) values('drake',$1,$2) on conflict(slug) do nothing",[artistMap.get(DRAKE_MBID),payload({provider:'musicbrainz',artistId:DRAKE_MBID,method:'explicit supplied MBID verified as Canadian rapper'})]);
    const ids = new Map(); const songs = []; const songProviders = []; const songArtists = []; const codes = [];
    let newSongs=0;
    for (const cluster of plan.clusters) {
      const existingIds=[...new Set(cluster.members.map(r => previousMap.get(r.id)).filter(Boolean))];
      if (existingIds.length > 1) throw new Error(`existing_canonical_merge_requires_review:${cluster.key}`);
      const id=existingIds[0] || randomUUID(); if (!existingIds.length) newSongs++; ids.set(cluster.key,id);
      const best=[...cluster.members].sort((a,b) => b.isrcs.length-a.isrcs.length || Number(/clean|censored/i.test(a.disambiguation))-Number(/clean|censored/i.test(b.disambiguation)) || a.id.localeCompare(b.id))[0];
      const drakeRoles=[...new Set(cluster.members.flatMap(r => r.artists.filter(a => a.id===DRAKE_MBID).map(a => a.role)))];
      const flags=plan.appearancesByCluster.get(cluster.key).map(a=>a.explicit).filter(v=>v!==null);
      songs.push({id,title:best.title,normalized:songTitle(best.title),primaryArtist:artistMap.get(best.artists[0].id),version:best.version,duration:best.length,
        explicit:flags.length?flags.includes(true):null,review:plan.reviews.some(r => cluster.members.some(m => m.id===r.a || m.id===r.b))?'needs_review':'unprocessed',
        metadata:{provider:'musicbrainz',catalogType:'official_released',drakeCreditRoles:drakeRoles,recordings:cluster.members.map(r => ({id:r.id,title:r.title,isrcs:r.isrcs,length:r.length,disambiguation:r.disambiguation,releaseGroups:r.groups,artists:r.artists,...r.source})),identityEvidence:plan.merges.filter(m => cluster.members.some(r => r.id===m.a)&&cluster.members.some(r => r.id===m.b))}});
      for (const member of cluster.members) { songProviders.push({song:id,external:member.id}); for (const isrc of member.isrcs) codes.push({song:id,isrc}); }
      const credited=[...new Map([...best.artists,...cluster.members.flatMap(r=>r.artists)].map(a=>[a.id,a])).values()];
      for (const [position,artist] of credited.entries()) songArtists.push({song:id,artist:artistMap.get(artist.id),role:artist.role,position,provenance:'MusicBrainz performing credits and explicit feature join phrases. Supported clean/explicit credit omissions retain the union of credited artists; joint credits remain primary.'});
    }
    await client.query(`insert into public.songs(id,title,normalized_title,primary_artist_id,version_key,duration_ms,explicit,identity_review_status,catalog_type,source_metadata)
      select id,title,normalized,"primaryArtist",version,nullif(duration,0),explicit,review::public.review_status,'official_released',metadata from jsonb_to_recordset($1) as x(id uuid,title text,normalized text,"primaryArtist" uuid,version text,duration int,explicit boolean,review text,metadata jsonb)
      on conflict(id) do update set source_metadata=excluded.source_metadata`,[payload(songs)]);
    await client.query(`insert into public.song_provider_ids(provider,provider_id,song_id,url) select 'musicbrainz',external,song,'https://musicbrainz.org/recording/'||external from jsonb_to_recordset($1) as x(song uuid,external text) on conflict(provider,provider_id) do update set fetched_at=now()`,[payload(songProviders)]);
    await client.query(`insert into public.song_artists(song_id,artist_id,role,credit_order,role_provenance) select song,artist,role,position,provenance from jsonb_to_recordset($1) as x(song uuid,artist uuid,role text,position int,provenance text) on conflict(song_id,artist_id) do nothing`,[payload(songArtists)]);
    await client.query(`insert into public.song_recording_codes(song_id,isrc,source_provider) select distinct song,isrc,'musicbrainz' from jsonb_to_recordset($1) as x(song uuid,isrc text) on conflict(song_id,isrc) do nothing`,[payload(codes)]);
    const {rows:previousReleases}=await client.query("select provider_id,release_id from public.release_provider_ids where provider='musicbrainz'");
    const releaseMap=new Map(previousReleases.map(r => [r.provider_id,r.release_id]));
    const releases=[];const releaseArtists=[];let newReleases=0;
    for (const release of plan.releases.filter(r => usedReleaseIds.has(r.id))) {
      if (!releaseMap.has(release.id)) { releaseMap.set(release.id,randomUUID());newReleases++; }
      const id=releaseMap.get(release.id);const meta=releaseMetadata(release);
      releases.push({id,external:release.id,title:release.title,normalized:normalized(release.title),type:meta.type,date:meta.date,precision:meta.precision,barcode:/^\d{8,14}$/.test(release.barcode||'')?release.barcode:null,count:release['track-count']??(release.media||[]).reduce((n,m)=>n+(m.sourceTotalTrackCount??m['track-count']),0),edition:release.disambiguation || null,
        artwork:release['cover-art-archive']?.front?[{url:`https://coverartarchive.org/release/${release.id}/front`,width:null,height:null}]:[],metadata:{...meta.source,originalBarcode:release.barcode,targetedTrackListing:release.targetedTrackListing||false}});
      for (const [index,c] of (release['artist-credit']||[]).filter(c => c.artist?.id).entries()) releaseArtists.push({release:id,artist:artistMap.get(c.artist.id),position:index});
    }
    await client.query(`insert into public.releases(id,title,normalized_title,release_type,release_date,date_precision,upc,track_count,edition,artwork,source_metadata)
      select id,title,normalized,type,date,precision,barcode,count,edition,artwork,metadata from jsonb_to_recordset($1) as x(id uuid,title text,normalized text,type text,date date,precision text,barcode text,count int,edition text,artwork jsonb,metadata jsonb) on conflict(id) do update set source_metadata=excluded.source_metadata`,[payload(releases)]);
    await client.query(`insert into public.release_provider_ids(provider,provider_id,release_id,url) select 'musicbrainz',external,id,'https://musicbrainz.org/release/'||external from jsonb_to_recordset($1) as x(id uuid,external text) on conflict(provider,provider_id) do update set fetched_at=now()`,[payload(releases)]);
    await client.query(`insert into public.release_artists(release_id,artist_id,credit_order) select release,artist,position from jsonb_to_recordset($1) as x(release uuid,artist uuid,position int) on conflict(release_id,artist_id) do nothing`,[payload(releaseArtists)]);
    const appearances=plan.appearances.map(a => ({release:releaseMap.get(a.releaseId),song:ids.get(plan.recordingToCluster.get(a.recordingId)),disc:a.disc,position:a.position,title:a.title,length:a.length,explicit:a.explicit,external:a.trackId,metadata:a.source}));
    await client.query(`insert into public.release_tracks(release_id,song_id,track_number,disc_number,appearance_title,duration_ms,explicit,source_metadata) select release,song,position,disc,title,nullif(length,0),explicit,metadata from jsonb_to_recordset($1) as x(release uuid,song uuid,position int,disc int,title text,length int,explicit boolean,metadata jsonb)
      on conflict(release_id,disc_number,track_number) do update set source_metadata=excluded.source_metadata`,[payload(appearances)]);
    await client.query(`insert into public.appearance_provider_ids(appearance_id,provider,provider_id) select t.id,'musicbrainz',x.external from jsonb_to_recordset($1) as x(release uuid,disc int,position int,external text) join public.release_tracks t on t.release_id=x.release and t.disc_number=x.disc and t.track_number=x.position on conflict(appearance_id,provider) do update set provider_id=excluded.provider_id`,[payload(appearances)]);
    const reviews=new Map();
    for (const review of plan.reviews) {
      const pair=[ids.get(plan.recordingToCluster.get(review.a)),ids.get(plan.recordingToCluster.get(review.b))].sort();
      const key=pair.join('|');const existing=reviews.get(key)||{a:pair[0],b:pair[1],evidence:{provider:'musicbrainz',cases:[]}};existing.evidence.cases.push(review);reviews.set(key,existing);
    }
    await client.query(`insert into public.duplicate_reviews(song_a_id,song_b_id,evidence) select a,b,evidence from jsonb_to_recordset($1) as x(a uuid,b uuid,evidence jsonb) on conflict(song_a_id,song_b_id) do update set evidence=excluded.evidence`,[payload([...reviews.values()])]);
    await client.query('commit'); return {newSongs,newReleases,canonicalIds:Object.fromEntries(ids),persistedDuplicateReviewPairs:reviews.size};
  } catch(error) { await client.query('rollback');throw error; }
}
