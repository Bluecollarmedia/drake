import type { CatalogAdapter, CatalogArtist, CatalogRelease, CatalogTrack, ReleaseReference } from './types.ts';
import { normalizeIsrc, normalizeName } from './identity.ts';
import { CatalogError, fetchJson, list, optionalText, positive, providerLink, record, releaseDate, safeProviderUrl, text } from './http.ts';

export class SpotifyCatalogAdapter implements CatalogAdapter {
  provider='spotify' as const; market:string; targetArtistId:string;
  coverage:Record<string,unknown>;
  private clientId:string;private secret:string;private token:string|null=null;private expires=0;
  private trackCache=new Map<string,CatalogTrack>();
  constructor(clientId:string,secret:string,market='US',artistId='3TVXtAsR1Inumwj472S9r4') {
    if(!clientId||!secret)throw new CatalogError('spotify_credentials_required');
    if(!/^[A-Z]{2}$/.test(market)||!/^[A-Za-z0-9]{22}$/.test(artistId))throw new CatalogError('invalid_catalog_target');
    this.clientId=clientId;this.secret=secret;this.market=market;this.targetArtistId=artistId;
    this.coverage={source:'Spotify Web API',market,artist_id:artistId,source_artist_url:`https://open.spotify.com/artist/${artistId}`,
      queried_groups:['album','single','appears_on','compilation'],
      included:'API-listed releases and tracks explicitly crediting the configured Drake artist ID. Deluxe, reissue, EP and mixtape material may be listed as albums or singles.',
      excluded:'Uncredited tracks, unavailable/taken-down/unreleased material, other storefronts, unlisted features, audio and lyrics.',
      limitations:['API coverage is not proof of the complete discography.','Release classification follows provider metadata; EP/mixtape labels may be unavailable.','Featured status is not inferred solely from credit order.','Market relinks with changed IDs require review.','Spotify 2026 development-mode eligibility, fields and endpoint access may limit results.']};
  }
  private async request(resource:string,retryToken=true):Promise<Record<string,unknown>> {
    if(!this.token||Date.now()>=this.expires) {
      const result=record(await fetchJson('https://accounts.spotify.com/api/token',{
        Authorization:`Basic ${Buffer.from(`${this.clientId}:${this.secret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded',
      },'POST','grant_type=client_credentials'));
      this.token=text(result.access_token);this.expires=Date.now()+(positive(result.expires_in)??3600)*1000-60000;
    }
    const url=safeProviderUrl(resource,'https://api.spotify.com');
    try{return record(await fetchJson(url,{Authorization:`Bearer ${this.token}`}));}
    catch(error){if(retryToken&&error instanceof CatalogError&&error.code==='provider_http_401'){this.token=null;return this.request(resource,false);}throw error;}
  }
  private artist(value:unknown):CatalogArtist {
    const artist=record(value);return {id:text(artist.id),name:text(artist.name),url:providerLink(record(artist.external_urls ?? {}).spotify,'open.spotify.com')};
  }
  async verifyTarget() {
    const artist=this.artist(await this.request(`/v1/artists/${this.targetArtistId}`));
    if(artist.id!==this.targetArtistId||normalizeName(artist.name)!=='drake')throw new CatalogError('target_artist_requires_review');
    return artist;
  }
  private async pages(resource:string) {
    const output:unknown[]=[];const seen=new Set<string>();let next:string|null=resource;
    while(next) {
      if(seen.has(next))throw new CatalogError('repeated_pagination_page');seen.add(next);
      const page=await this.request(next);output.push(...list(page.items));next=optionalText(page.next);
    }
    return output;
  }
  async listReleases() {
    const releases=new Map<string,ReleaseReference>();
    for(const group of ['album','single','appears_on','compilation']) {
      const items=await this.pages(`/v1/artists/${this.targetArtistId}/albums?include_groups=${group}&market=${this.market}&limit=10`);
      for(const item of items) {
        const id=text(record(item).id);const existing=releases.get(id);
        if(existing){if(!existing.groups.includes(group))existing.groups.push(group);}else releases.set(id,{id,groups:[group]});
      }
    }
    return [...releases.values()];
  }
  private async track(id:string):Promise<CatalogTrack> {
    const cached=this.trackCache.get(id);if(cached)return cached;
    const track=await this.request(`/v1/tracks/${id}?market=${this.market}`);
    if(track.id!==id)throw new CatalogError('market_relink_requires_review');
    const result:CatalogTrack={id,title:text(track.name),artists:list(track.artists).map(value=>this.artist(value)),
      url:providerLink(record(track.external_urls??{}).spotify,'open.spotify.com'),isrc:normalizeIsrc(record(track.external_ids??{}).isrc),
      durationMs:positive(track.duration_ms),explicit:typeof track.explicit==='boolean'?track.explicit:null,
      disc:positive(track.disc_number)??1,number:positive(track.track_number)??0};
    if(!result.artists.length || !result.number)throw new CatalogError('missing_track_identity');
    this.trackCache.set(id,result);return result;
  }
  async fetchRelease(reference:ReleaseReference):Promise<CatalogRelease> {
    const album=await this.request(`/v1/albums/${reference.id}?market=${this.market}`);
    const tracks:CatalogTrack[]=[];const errors:{resource:string;code:string}[]=[];let excluded=0;
    const items=await this.pages(`/v1/albums/${reference.id}/tracks?market=${this.market}&limit=50`);
    for(const item of items) {
      const appearance=record(item);const id=optionalText(appearance.id);
      if(!id){errors.push({resource:reference.id,code:'missing_track_id'});continue;}
      if(!list(appearance.artists).some(artist=>record(artist).id===this.targetArtistId)){excluded++;continue;}
      try {
        const recording=await this.track(id);
        if(!recording.artists.some(artist=>artist.id===this.targetArtistId)){errors.push({resource:id,code:'drake_credit_missing_in_full_track'});continue;}
        // Appearance positions belong to this release, not to a cached recording's original release.
        tracks.push({...recording,disc:positive(appearance.disc_number)??1,number:positive(appearance.track_number)??0});
      }catch(error){if(error instanceof CatalogError && /^(rate_limited|provider_http_40[13])/.test(error.code))throw error;errors.push({resource:id,code:error instanceof CatalogError?error.code:'track_fetch_failed'});}
    }
    const type=album.album_type==='album'||album.album_type==='single'||album.album_type==='compilation'?album.album_type:'unknown';
    return {id:text(album.id),title:text(album.name),artists:list(album.artists).map(value=>this.artist(value)),
      url:providerLink(record(album.external_urls??{}).spotify,'open.spotify.com'),type,...releaseDate(album.release_date,album.release_date_precision),
      upc:optionalText(record(album.external_ids??{}).upc),trackCount:positive(album.total_tracks),
      artwork:list(album.images??[]).map(value=>{const image=record(value);return {url:text(image.url),width:positive(image.width),height:positive(image.height)};}),
      tracks,excludedTracks:excluded,errors};
  }
}
