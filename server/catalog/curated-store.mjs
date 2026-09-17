import { randomUUID, createHash } from 'node:crypto';
import { normalized } from './musicbrainz-identity.mjs';
import { releaseMetadata } from './musicbrainz-plan.mjs';
import { DRAKE_MBID } from './musicbrainz-client.mjs';
const json=JSON.stringify;
export async function persistCuratedPlan(client,plan,{masterSlug}={}){
  const slug=masterSlug||(plan.master.scope==='feature_guest'?'drake-feature-master':'drake-lead-master');
  await client.query('begin');
  try{
    await client.query("select pg_advisory_xact_lock(hashtext('which-drake.catalog'))");
    const {rows:externalArtists}=await client.query("select p.provider_id,p.artist_id,a.name from public.artist_provider_ids p join public.artists a on a.id=p.artist_id where p.provider='musicbrainz'");
    const artistMap=new Map(externalArtists.map(a=>[a.provider_id,a.artist_id]));
    const artists=new Map();
    const addArtists=values=>{for(const a of values){if(!artistMap.has(a.id))artistMap.set(a.id,randomUUID());artists.set(a.id,{id:artistMap.get(a.id),external:a.id,name:a.name,normalized:normalized(a.name)});}};
    const {rows:subject}=await client.query("select artist_id from public.catalog_subjects where slug='drake'");
    if(subject[0])artistMap.set(DRAKE_MBID,subject[0].artist_id);
    addArtists([{id:DRAKE_MBID,name:'Drake'}]);
    for(const c of plan.enriched)if(c.best)addArtists(c.best.artists);
    const usedReleases=new Set(plan.enriched.flatMap(c=>c.appearances.map(a=>a.releaseId)));
    for(const r of plan.releases.filter(r=>usedReleases.has(r.id)))addArtists((r['artist-credit']||[]).filter(c=>c.artist?.id).map(c=>({id:c.artist.id,name:c.artist.name||c.name})));
    const claimedCredits=new Map();const claimedArtists=[];
    const knownNames=new Map((await client.query('select id,normalized_name from public.artists')).rows.map(a=>[a.normalized_name,a.id]));
    for(const a of artists.values())knownNames.set(a.normalized,a.id);
    for(const c of plan.enriched.filter(c=>!c.best&&!c.explicitlyReview)){
      const parts=c.entries[0].credit.split(/\s+feat\.?\s+/i);
      const credited=parts.flatMap((part,index)=>part.split(/\s*&\s*|,\s*/).map(name=>({name:name.trim(),role:index?'featured':'primary'})));
      claimedCredits.set(c.key,credited.map(a=>{
        const name=normalized(a.name);if(!knownNames.has(name)){const id=randomUUID();knownNames.set(name,id);claimedArtists.push({id,name:a.name,normalized:name});}
        return {...a,id:knownNames.get(name)};
      }));
    }
    await client.query(`insert into public.artists(id,name,normalized_name) select id,name,normalized from jsonb_to_recordset($1) as x(id uuid,name text,normalized text) on conflict(id) do nothing`,[json([...artists.values()])]);
    await client.query(`insert into public.artists(id,name,normalized_name) select id,name,normalized from jsonb_to_recordset($1) as x(id uuid,name text,normalized text) on conflict(id) do nothing`,[json(claimedArtists)]);
    await client.query(`insert into public.artist_provider_ids(provider,provider_id,artist_id,url) select 'musicbrainz',external,id,'https://musicbrainz.org/artist/'||external from jsonb_to_recordset($1) as x(id uuid,external text) on conflict(provider,provider_id) do nothing`,[json([...artists.values()])]);
    await client.query("insert into public.catalog_subjects(slug,artist_id,source_notes) values('drake',$1,$2) on conflict(slug) do nothing",[artistMap.get(DRAKE_MBID),json({method:'User supplied verified Canadian rapper MusicBrainz identity',artistId:DRAKE_MBID})]);
    const {rows:oldMemberships}=await client.query('select candidate_key,song_id,id from public.catalog_memberships where scope=$1',[plan.master.scope]);
    const oldMap=new Map(oldMemberships.map(m=>[m.candidate_key,m]));
    const {rows:oldProviders}=await client.query("select provider_id,song_id from public.song_provider_ids where provider='musicbrainz'");
    const providerMap=new Map(oldProviders.map(p=>[p.provider_id,p.song_id]));
    const {rows:listRows}=await client.query('select id from public.catalog_master_lists where slug=$1 and content_hash=$2',[slug,plan.master.hash]);
    const listId=listRows[0]?.id||randomUUID();
    await client.query('update public.catalog_master_lists set active=false where slug=$1',[slug]);
    await client.query(`insert into public.catalog_master_lists(id,slug,scope,content_hash,raw_text) values($1,$2,$3,$4,$5) on conflict(id) do update set active=true`,[listId,slug,plan.master.scope,plan.master.hash,plan.master.rawText]);
    const candidateIds=new Map();const membershipIds=new Map();const songs=[];const memberships=[];const credits=[];const codes=[];const providers=[];
    let newSongs=0;
    for(const c of plan.enriched){
      const previous=oldMap.get(c.key);
      const existing=[...new Set([previous?.song_id,...c.recordingIds.map(r=>providerMap.get(r))].filter(Boolean))];
      if(existing.length>1)throw new Error(`existing_uuid_merge_requires_review:${c.key}`);
      const song=existing[0]||randomUUID();if(!existing.length)newSongs++;
      const membership=previous?.id||randomUUID();candidateIds.set(c.key,song);membershipIds.set(c.key,membership);
      const best=c.best;
      const meta={membershipSource:'curated_master_list',scope:plan.master.scope,masterHash:plan.master.hash,suppliedTitle:c.title,suppliedRoles:c.roles,suppliedEntries:c.entries,
        officialTitle:best?.title||null,metadataSource:best?'musicbrainz':null,metadataMatchStatus:best?'matched':'pending_review',
        recordingEvidence:[...new Map(c.appearances.map(a=>[a.recordingId,{id:a.recordingId,title:a.title,durationMs:a.length,isrcs:a.isrcs,artists:a.artists,disambiguation:a.disambiguation,url:a.sourceURL}])).values()],
        nonDspReleaseClaim:c.entries.some(e=>e.nonDsp),metadataReviews:c.reviews};
      songs.push({id:song,title:c.title,normalized:normalized(c.title),primaryArtist:best?artistMap.get(best.artists[0]?.id)||null:!c.explicitlyReview?(claimedCredits.get(c.key)?.find(a=>a.role==='primary')?.id||artistMap.get(DRAKE_MBID)):null,
        version:c.version,duration:best?.length||null,explicit:best?.explicit??null,review:c.status==='approved'?'approved':'needs_review',metadata:meta});
      memberships.push({id:membership,scope:plan.master.scope,key:c.key,song,list:listId,title:c.title,roles:c.roles,status:c.status,requires:c.explicitlyReview||c.reviews.some(r=>r.blocking&&/performance|performing|vocal/.test(r.reason)),
        reasons:c.reviews,summary:{matched:!!best,officialTitle:best?.title||null,appearanceCount:c.appearances.length,providerRecordingCount:c.recordingIds.length}});
      if(best)for(const [position,a] of best.artists.entries())credits.push({song,artist:artistMap.get(a.id),role:a.role,position,provenance:'MusicBrainz factual performing artist credit; exact curated Role and Credit fields are retained independently.'});
      else if(!c.explicitlyReview)for(const [position,a] of (claimedCredits.get(c.key)||[]).entries())credits.push({song,artist:a.id,role:a.role,position,provenance:'User-supplied curated performing credit claim; unverified metadata, candidate held for review. No external artist ID invented.'});
      for(const a of c.appearances){for(const isrc of a.isrcs)codes.push({song,isrc});}
      for(const id of c.recordingIds)providers.push({song,external:id});
    }
    if(new Set(candidateIds.values()).size!==plan.enriched.length)throw new Error('multiple_master_candidates_share_existing_uuid_requires_review');
    await client.query(`insert into public.songs(id,title,normalized_title,primary_artist_id,version_key,duration_ms,explicit,identity_review_status,catalog_type,source_metadata) select id,title,normalized,"primaryArtist",version,nullif(duration,0),explicit,review::public.review_status,'official_released',metadata from jsonb_to_recordset($1) as x(id uuid,title text,normalized text,"primaryArtist" uuid,version text,duration int,explicit boolean,review text,metadata jsonb)
      on conflict(id) do update set source_metadata=case when public.songs.source_metadata->>'scope' is distinct from excluded.source_metadata->>'scope' then public.songs.source_metadata else public.songs.source_metadata||excluded.source_metadata end`,[json(songs)]);
    await client.query(`insert into public.song_provider_ids(provider,provider_id,song_id,url) select 'musicbrainz',external,song,'https://musicbrainz.org/recording/'||external from jsonb_to_recordset($1) as x(song uuid,external text) on conflict(provider,provider_id) do update set fetched_at=now()`,[json(providers)]);
    await client.query(`insert into public.song_artists(song_id,artist_id,role,credit_order,role_provenance) select song,artist,role,position,provenance from jsonb_to_recordset($1) as x(song uuid,artist uuid,role text,position int,provenance text) on conflict(song_id,artist_id) do nothing`,[json(credits)]);
    await client.query(`insert into public.song_recording_codes(song_id,isrc,source_provider) select distinct song,isrc,'musicbrainz' from jsonb_to_recordset($1) as x(song uuid,isrc text) on conflict(song_id,isrc) do nothing`,[json(codes)]);
    // Replace only this master list's membership; targeted supplements must leave other lists intact.
    await client.query('update public.catalog_memberships set active=false where scope=$1 and master_list_id in (select id from public.catalog_master_lists where slug=$2)',[plan.master.scope,slug]);
    await client.query(`insert into public.catalog_memberships(id,scope,candidate_key,song_id,master_list_id,supplied_title,supplied_roles,status,requires_performance_review,review_reasons,metadata_summary)
      select id,scope,key,song,list,title,array(select jsonb_array_elements_text(roles)),status,requires,reasons,summary from jsonb_to_recordset($1) as x(id uuid,scope text,key text,song uuid,list uuid,title text,roles jsonb,status text,requires boolean,reasons jsonb,summary jsonb)
      on conflict(scope,candidate_key) do update set master_list_id=excluded.master_list_id,active=true,supplied_title=excluded.supplied_title,supplied_roles=excluded.supplied_roles,
        status=case when public.catalog_memberships.status='needs_review' then 'needs_review' else excluded.status end,
        requires_performance_review=public.catalog_memberships.requires_performance_review or excluded.requires_performance_review,review_reasons=excluded.review_reasons,metadata_summary=excluded.metadata_summary`,[json(memberships)]);
    const entries=plan.master.entries.map(e=>({...e,list:listId,song:candidateIds.get(e.candidateKey)}));
    await client.query(`insert into public.catalog_master_entries(master_list_id,ordinal,song_id,candidate_key,raw_entry,supplied_title,supplied_credit,supplied_role,supplied_version,qualifier,project,supplied_year,list_position,supplied_primary_artist)
      select list,ordinal,song,"candidateKey",raw,title,credit,role,"versionNotes",qualifier,project,year,"projectPosition","primary" from jsonb_to_recordset($1) as x(list uuid,ordinal int,song uuid,"candidateKey" text,raw text,title text,credit text,role text,"versionNotes" text,qualifier text,project text,year int,"projectPosition" int,"primary" text) on conflict(master_list_id,ordinal) do nothing`,[json(entries)]);
    const reviews=plan.enriched.flatMap(c=>c.reviews.map(r=>({membership:membershipIds.get(c.key),key:createHash('sha256').update(json({reason:r.reason,evidence:r.evidence})).digest('hex'),...r})));
    await client.query(`insert into public.catalog_metadata_reviews(membership_id,review_key,reason,blocking,evidence) select membership,key,reason,blocking,evidence from jsonb_to_recordset($1) as x(membership uuid,key text,reason text,blocking boolean,evidence jsonb) on conflict(membership_id,review_key) do update set evidence=excluded.evidence`,[json(reviews)]);
    const {rows:oldReleases}=await client.query("select provider_id,release_id from public.release_provider_ids where provider='musicbrainz'");
    const releaseMap=new Map(oldReleases.map(r=>[r.provider_id,r.release_id]));const releases=[];const releaseArtists=[];let newReleases=0;
    for(const r of plan.releases.filter(r=>usedReleases.has(r.id))){
      if(!releaseMap.has(r.id)){releaseMap.set(r.id,randomUUID());newReleases++;}
      const id=releaseMap.get(r.id);const meta=releaseMetadata(r);
      releases.push({id,external:r.id,title:r.title,normalized:normalized(r.title),type:meta.type,date:meta.date,precision:meta.precision,
        count:r['track-count']??r.media.reduce((n,m)=>n+(m.sourceTotalTrackCount??m['track-count']),0),edition:r.disambiguation||null,
        artwork:r['cover-art-archive']?.front?[{url:`https://coverartarchive.org/release/${r.id}/front`,source:'MusicBrainz Cover Art Archive',width:null,height:null}]:[],metadata:{...meta.source,targetedTrackListing:!!r.targetedTrackListing}});
      for(const [position,a] of (r['artist-credit']||[]).filter(a=>a.artist?.id).entries())releaseArtists.push({release:id,artist:artistMap.get(a.artist.id),position});
    }
    await client.query(`insert into public.releases(id,title,normalized_title,release_type,release_date,date_precision,track_count,edition,artwork,source_metadata) select id,title,normalized,type,date,precision,count,edition,artwork,metadata from jsonb_to_recordset($1) as x(id uuid,title text,normalized text,type text,date date,precision text,count int,edition text,artwork jsonb,metadata jsonb) on conflict(id) do update set source_metadata=public.releases.source_metadata||excluded.source_metadata`,[json(releases)]);
    await client.query(`insert into public.release_provider_ids(provider,provider_id,release_id,url) select 'musicbrainz',external,id,'https://musicbrainz.org/release/'||external from jsonb_to_recordset($1) as x(id uuid,external text) on conflict(provider,provider_id) do update set fetched_at=now()`,[json(releases)]);
    await client.query(`insert into public.release_artists(release_id,artist_id,credit_order) select release,artist,position from jsonb_to_recordset($1) as x(release uuid,artist uuid,position int) on conflict(release_id,artist_id) do nothing`,[json(releaseArtists)]);
    const appearances=plan.enriched.flatMap(c=>c.appearances.map(a=>({release:releaseMap.get(a.releaseId),song:candidateIds.get(c.key),disc:a.disc,position:a.position,title:a.trackTitle,duration:a.length,explicit:a.explicit,external:a.trackId,
      metadata:{provider:'musicbrainz',recordingId:a.recordingId,creditSource:a.creditSource,artistCredit:a.trackCredit,recordingArtistCredit:a.recordingCredit,releaseStatus:a.releaseStatus,releaseGroupId:a.groupId,masterCandidate:c.key}})));
    const places=new Map();for(const a of appearances){const k=`${a.release}:${a.disc}:${a.position}`;if(places.has(k)&&places.get(k).song!==a.song)throw new Error(`release_track_matches_multiple_candidates:${k}`);places.set(k,a);}
    const existingTracks=(await client.query('select release_id,disc_number,track_number,song_id from public.release_tracks')).rows;
    for(const t of existingTracks){const incoming=places.get(`${t.release_id}:${t.disc_number}:${t.track_number}`);if(incoming&&incoming.song!==t.song_id)throw new Error('existing_release_appearance_reassignment_requires_review');}
    await client.query(`insert into public.release_tracks(release_id,song_id,track_number,disc_number,appearance_title,duration_ms,explicit,source_metadata) select release,song,position,disc,title,nullif(duration,0),explicit,metadata from jsonb_to_recordset($1) as x(release uuid,song uuid,position int,disc int,title text,duration int,explicit boolean,metadata jsonb) on conflict(release_id,disc_number,track_number) do update set source_metadata=public.release_tracks.source_metadata||excluded.source_metadata`,[json([...places.values()])]);
    await client.query(`insert into public.appearance_provider_ids(appearance_id,provider,provider_id) select t.id,'musicbrainz',x.external from jsonb_to_recordset($1) as x(release uuid,disc int,position int,external text) join public.release_tracks t on t.release_id=x.release and t.disc_number=x.disc and t.track_number=x.position on conflict(appearance_id,provider) do update set provider_id=excluded.provider_id`,[json([...places.values()])]);
    await client.query('commit');
    return {masterListId:listId,newSongs,newReleases,candidateIds:Object.fromEntries(candidateIds),membershipIds:Object.fromEntries(membershipIds),appearances:places.size};
  }catch(error){await client.query('rollback');throw error;}
}
