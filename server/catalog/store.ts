import { randomUUID } from 'node:crypto';
import type { Client } from 'pg';
import { isHighConfidenceMatch,normalizeName,normalizeTitle,versionKey,type RecordingCandidate } from './identity.ts';
import type { CatalogArtist,CatalogRelease,CatalogTrack,Provider } from './types.ts';
export interface ImportDelta { appearances:number;newSongs:number;newReleases:number;merged:number;reviews:number;metadataDrift:string[] }
export class CanonicalCatalogStore {
  private client:Client;private provider:Provider;private market:string;
  constructor(client:Client,provider:Provider,market:string){this.client=client;this.provider=provider;this.market=market;}
  async pinTarget(artist:CatalogArtist) {
    await this.client.query('begin');
    try {
    const {rows:existing}=await this.client.query<{artist_id:string}>('select artist_id from public.catalog_subjects where slug=$1',['drake']);
    const {rows:mapped}=await this.client.query<{artist_id:string}>('select artist_id from public.artist_provider_ids where provider=$1 and provider_id=$2',[this.provider,artist.id]);
    const id=existing[0]?.artist_id??mapped[0]?.artist_id??randomUUID();
    if(mapped[0]&&mapped[0].artist_id!==id)throw new Error('target_artist_mapping_requires_review');
    await this.client.query('insert into public.artists(id,name,normalized_name) values($1,$2,$3) on conflict(id) do nothing',[id,artist.name,normalizeName(artist.name)]);
    await this.client.query('insert into public.artist_provider_ids(provider,provider_id,artist_id,url) values($1,$2,$3,$4) on conflict(provider,provider_id) do update set url=excluded.url',[this.provider,artist.id,id,artist.url]);
    await this.client.query('insert into public.catalog_subjects(slug,artist_id,source_notes) values($1,$2,$3) on conflict(slug) do nothing',['drake',id,JSON.stringify({method:'explicit catalog-subject provider IDs; verified by provider API',provider:this.provider,artist_id:artist.id,url:artist.url})]);
    await this.client.query('commit');return id;
    } catch(error) { await this.client.query('rollback');throw error; }
  }
  private async artist(artist:CatalogArtist) {
    const {rows}=await this.client.query<{artist_id:string}>('select artist_id from public.artist_provider_ids where provider=$1 and provider_id=$2',[this.provider,artist.id]);
    if(rows[0])return rows[0].artist_id;
    const id=randomUUID();
    await this.client.query('insert into public.artists(id,name,normalized_name) values($1,$2,$3)',[id,artist.name,normalizeName(artist.name)]);
    await this.client.query('insert into public.artist_provider_ids(provider,provider_id,artist_id,url) values($1,$2,$3,$4)',[this.provider,artist.id,id,artist.url]);
    return id;
  }
  private async candidates(track:CatalogTrack,primary:string) {
    const {rows}=await this.client.query<RecordingCandidate>(`select s.id,s.normalized_title,s.version_key,s.duration_ms,s.explicit,s.primary_artist_id,
      array(select artist_id::text from public.song_artists where song_id=s.id) artist_ids,
      array(select isrc from public.song_recording_codes where song_id=s.id) isrcs from public.songs s
      where (s.normalized_title=$1 and s.primary_artist_id=$2) or ($3::text is not null and exists(select 1 from public.song_recording_codes c where c.song_id=s.id and c.isrc=$3))`,[normalizeTitle(track.title),primary,track.isrc]);
    return rows;
  }
  private async song(track:CatalogTrack,delta:ImportDelta) {
    const artistIds:string[]=[];for(const artist of track.artists)artistIds.push(await this.artist(artist));
    if(!artistIds[0])throw new Error('missing_artist_credit');
    const {rows:mapped}=await this.client.query<RecordingCandidate>(`select s.id,s.normalized_title,s.version_key,s.duration_ms,s.explicit,s.primary_artist_id,
      array(select artist_id::text from public.song_artists where song_id=s.id) artist_ids,
      array(select isrc from public.song_recording_codes where song_id=s.id) isrcs
      from public.song_provider_ids p join public.songs s on s.id=p.song_id where p.provider=$1 and p.provider_id=$2`,[this.provider,track.id]);
    if(mapped[0]) {
      const previous=mapped[0];
      const changedCode=track.isrc!==null&&previous.isrcs.length>0&&!previous.isrcs.includes(track.isrc);
      if(previous.normalized_title!==normalizeTitle(track.title)||previous.version_key!==versionKey(track.title)
        || previous.primary_artist_id!==artistIds[0] || [...new Set(previous.artist_ids)].sort().join('|')!==[...new Set(artistIds)].sort().join('|')
        || (previous.duration_ms!==null&&track.durationMs!==null&&Math.abs(previous.duration_ms-track.durationMs)>1000)
        || (previous.explicit!==null&&track.explicit!==null&&previous.explicit!==track.explicit) || changedCode) {
        delta.metadataDrift.push(track.id);
        await this.client.query("update public.songs set identity_review_status='needs_review' where id=$1",[mapped[0].id]);
      }
      await this.client.query('update public.song_provider_ids set url=$1,fetched_at=now() where provider=$2 and provider_id=$3',[track.url,this.provider,track.id]);
      if(track.isrc&&!changedCode)await this.client.query('insert into public.song_recording_codes(song_id,isrc,source_provider) values($1,$2,$3) on conflict(song_id,isrc) do nothing',[previous.id,track.isrc,this.provider]);
      return mapped[0].id;
    }
    const candidates=await this.candidates(track,artistIds[0]);
    const matches=candidates.filter(candidate=>isHighConfidenceMatch(track,artistIds,candidate));
    let id:string;
    if(matches.length===1){id=matches[0].id;delta.merged++;}
    else {
      id=randomUUID();delta.newSongs++;
      await this.client.query(`insert into public.songs(id,title,normalized_title,primary_artist_id,version_key,duration_ms,explicit,identity_review_status)
        values($1,$2,$3,$4,$5,$6,$7,$8)`,[id,track.title,normalizeTitle(track.title),artistIds[0],versionKey(track.title),track.durationMs,track.explicit,candidates.length?'needs_review':'unprocessed']);
      for(let index=0;index<artistIds.length;index++)await this.client.query(`insert into public.song_artists(song_id,artist_id,role,credit_order,role_provenance) values($1,$2,$3,$4,$5) on conflict(song_id,artist_id) do nothing`,
        [id,artistIds[index],index===0?'primary':'collaborator',index,'Provider artist credit order; featured role not inferred.']);
      for(const candidate of candidates) {
        const [a,b]=[id,candidate.id].sort();
        const inserted=await this.client.query(`insert into public.duplicate_reviews(song_a_id,song_b_id,evidence) values($1,$2,$3) on conflict(song_a_id,song_b_id) do nothing`,
          [a,b,JSON.stringify({provider:this.provider,provider_track_id:track.id,isrc:track.isrc,reason:matches.length>1?'multiple_high_confidence_candidates':'insufficient_or_conflicting_identity_evidence',
            duration_ms:track.durationMs,explicit:track.explicit,version:versionKey(track.title),candidate_version:candidate.version_key})]);
        if(inserted.rowCount)delta.reviews++;
      }
    }
    await this.client.query('insert into public.song_provider_ids(provider,provider_id,song_id,url) values($1,$2,$3,$4)',[this.provider,track.id,id,track.url]);
    if(track.isrc)await this.client.query('insert into public.song_recording_codes(song_id,isrc,source_provider) values($1,$2,$3) on conflict(song_id,isrc) do nothing',[id,track.isrc,this.provider]);
    return id;
  }
  async applyRelease(release:CatalogRelease) {
    const delta:ImportDelta={appearances:0,newSongs:0,newReleases:0,merged:0,reviews:0,metadataDrift:[]};
    await this.client.query('begin');
    try {
      const {rows}=await this.client.query<{release_id:string}>('select release_id from public.release_provider_ids where provider=$1 and provider_id=$2',[this.provider,release.id]);
      const id=rows[0]?.release_id??randomUUID();
      // Releases remain separate across providers/editions until a trusted mapping is approved.
      if(!rows[0])delta.newReleases++;
      await this.client.query(`insert into public.releases(id,title,normalized_title,release_type,release_date,date_precision,upc,artwork,track_count,storefront)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict(id) do update set title=excluded.title,normalized_title=excluded.normalized_title,
        release_type=excluded.release_type,release_date=excluded.release_date,date_precision=excluded.date_precision,upc=excluded.upc,artwork=excluded.artwork,track_count=excluded.track_count`,
        [id,release.title,normalizeTitle(release.title),release.type,release.date,release.datePrecision,release.upc,JSON.stringify(release.artwork),release.trackCount,this.market]);
      await this.client.query(`insert into public.release_provider_ids(provider,provider_id,release_id,url) values($1,$2,$3,$4) on conflict(provider,provider_id) do update set url=excluded.url,fetched_at=now()`,[this.provider,release.id,id,release.url]);
      for(let index=0;index<release.artists.length;index++)await this.client.query(`insert into public.release_artists(release_id,artist_id,credit_order) values($1,$2,$3) on conflict(release_id,artist_id) do update set credit_order=excluded.credit_order`,[id,await this.artist(release.artists[index]),index]);
      for(const track of release.tracks) {
        const songId=await this.song(track,delta);
        const {rows:appearance}=await this.client.query<{id:string}>(`insert into public.release_tracks(release_id,song_id,track_number,disc_number,appearance_title,duration_ms,explicit)
          values($1,$2,$3,$4,$5,$6,$7) on conflict(release_id,disc_number,track_number) do update set song_id=excluded.song_id,
          appearance_title=excluded.appearance_title,duration_ms=excluded.duration_ms,explicit=excluded.explicit returning id`,[id,songId,track.number,track.disc,track.title,track.durationMs,track.explicit]);
        await this.client.query(`insert into public.appearance_provider_ids(appearance_id,provider,provider_id) values($1,$2,$3) on conflict(appearance_id,provider) do update set provider_id=excluded.provider_id`,[appearance[0].id,this.provider,track.id]);
        delta.appearances++;
      }
      await this.client.query('commit');return delta;
    }catch(error){await this.client.query('rollback');throw error;}
  }
  async statistics() {
    const {rows}=await this.client.query(`select (select count(*) from public.releases)::int releases,(select count(*) from public.release_tracks)::int release_track_appearances,
      (select count(*) from public.songs)::int canonical_songs,
      (select count(*) from public.songs s where (select count(*) from public.song_artists where song_id=s.id)>1)::int collaborations,
      (select count(*) from public.songs s join public.catalog_subjects t on t.slug='drake' where s.primary_artist_id<>t.artist_id and exists(select 1 from public.song_artists a where a.song_id=s.id and a.artist_id=t.artist_id))::int non_primary_drake_credits,
      (select count(*) from public.duplicate_reviews where status='pending')::int potential_duplicates_needing_review,
      (select count(*) from public.songs s where not exists(select 1 from public.song_provider_ids p where p.song_id=s.id and p.provider='spotify' and p.url is not null))::int missing_spotify_links,
      (select count(*) from public.songs s where not exists(select 1 from public.song_provider_ids p where p.song_id=s.id and p.provider='apple' and p.url is not null))::int missing_apple_links,
      (select count(*) from public.songs s where not exists(select 1 from public.song_provider_ids p where p.song_id=s.id and p.url is not null))::int missing_all_provider_links`);
    const {rows:multiple}=await this.client.query(`select s.id,s.title,jsonb_agg(jsonb_build_object('release',r.title,'release_id',r.id,'track',t.track_number,'disc',t.disc_number)) appearances from public.songs s join public.release_tracks t on t.song_id=s.id join public.releases r on r.id=t.release_id group by s.id having count(*)>1 order by count(*) desc limit 5`);
    const {rows:collaborations}=await this.client.query(`select s.title,jsonb_agg(jsonb_build_object('artist',a.name,'role',c.role,'credit_order',c.credit_order) order by c.credit_order) artists from public.songs s join public.song_artists c on c.song_id=s.id join public.artists a on a.id=c.artist_id group by s.id having count(*)>1 order by s.title limit 5`);
    return {...rows[0],multiple_release_examples:multiple,collaboration_examples:collaborations};
  }
}
