import type { CatalogAdapter,CatalogArtist,CatalogRelease,CatalogTrack,ReleaseReference } from './types.ts';
import { normalizeIsrc,normalizeName } from './identity.ts';
import { CatalogError,fetchJson,list,optionalText,positive,providerLink,record,releaseDate,safeProviderUrl,text } from './http.ts';
export class AppleCatalogAdapter implements CatalogAdapter {
  provider='apple' as const;market:string;targetArtistId:string;coverage:Record<string,unknown>;
  private token:string;private artists=new Map<string,CatalogArtist>();private songs=new Map<string,CatalogTrack>();
  constructor(token:string,storefront='us',artistId='271256') {
    if(!token)throw new CatalogError('apple_developer_token_required');
    if(!/^[a-z]{2}$/.test(storefront)||!/^\d+$/.test(artistId))throw new CatalogError('invalid_catalog_target');
    this.token=token;this.market=storefront;this.targetArtistId=artistId;
    this.coverage={source:'Apple Music API',storefront,artist_id:artistId,source_artist_url:`https://music.apple.com/${storefront}/artist/${artistId}`,
      queried_relationships:['artist.albums','album.tracks','song.artists'],
      included:'Artist-linked albums and singles with catalog song resources crediting Drake.',
      excluded:'Unlisted featured releases, music videos, unavailable/taken-down material, other storefronts, audio and lyrics.',
      limitations:['Artist albums are not an exhaustive index of all featured appearances.','Displayed artistName strings are not split into invented artist identities.','Artist relationships may omit featured credits.','Developer-token/provider configuration must be supplied; this adapter is not claimed live-verified until run.']};
  }
  private async request(resource:string) {return record(await fetchJson(safeProviderUrl(resource,'https://api.music.apple.com'),{Authorization:`Bearer ${this.token}`}));}
  private async resource(kind:'artists'|'albums'|'songs',id:string,include='') {
    const response=await this.request(`/v1/catalog/${this.market}/${kind}/${id}${include?`?include=${include}`:''}`);
    const values=list(response.data);if(values.length!==1)throw new CatalogError('missing_catalog_resource');return record(values[0]);
  }
  private async artist(id:string) {
    const cached=this.artists.get(id);if(cached)return cached;
    const artist=await this.resource('artists',id);const attributes=record(artist.attributes);
    const result={id:text(artist.id),name:text(attributes.name),url:providerLink(attributes.url,'music.apple.com')};this.artists.set(id,result);return result;
  }
  async verifyTarget(){const artist=await this.artist(this.targetArtistId);if(normalizeName(artist.name)!=='drake')throw new CatalogError('target_artist_requires_review');return artist;}
  private async credits(resource:Record<string,unknown>) {
    const relationship=record(record(resource.relationships).artists);
    const credits:CatalogArtist[]=[];for(const artist of list(relationship.data))credits.push(await this.artist(text(record(artist).id)));
    if(!credits.length)throw new CatalogError('missing_artist_relationship');return credits;
  }
  private async pages(resource:string) {
    const output:unknown[]=[];const seen=new Set<string>();let next:string|null=resource;
    while(next){if(seen.has(next))throw new CatalogError('repeated_pagination_page');seen.add(next);const page=await this.request(next);output.push(...list(page.data));next=optionalText(page.next);}
    return output;
  }
  async listReleases(){const items=await this.pages(`/v1/catalog/${this.market}/artists/${this.targetArtistId}/albums?limit=25`);return [...new Set(items.map(value=>text(record(value).id)))].map(id=>({id,groups:['artist.albums']}));}
  private async track(id:string):Promise<CatalogTrack> {
    const cached=this.songs.get(id);if(cached)return cached;
    const song=await this.resource('songs',id,'artists');const attributes=record(song.attributes);
    const result:CatalogTrack={id:text(song.id),title:text(attributes.name),artists:await this.credits(song),url:providerLink(attributes.url,'music.apple.com'),
      isrc:normalizeIsrc(attributes.isrc),durationMs:positive(attributes.durationInMillis),explicit:attributes.contentRating==='explicit'?true:attributes.contentRating==='clean'?false:null,
      disc:positive(attributes.discNumber)??1,number:positive(attributes.trackNumber)??0};
    this.songs.set(id,result);return result;
  }
  async fetchRelease(reference:ReleaseReference):Promise<CatalogRelease> {
    const album=await this.resource('albums',reference.id,'artists');const attributes=record(album.attributes);
    const items=await this.pages(`/v1/catalog/${this.market}/albums/${reference.id}/tracks?limit=25`);
    const tracks:CatalogTrack[]=[];const errors:{resource:string;code:string}[]=[];let excluded=0;
    for(const value of items){const item=record(value);const id=text(item.id);if(item.type!=='songs'){excluded++;continue;}
      try{const track=await this.track(id);if(!track.artists.some(artist=>artist.id===this.targetArtistId)){excluded++;continue;}
        const appearance=record(item.attributes??{});tracks.push({...track,disc:positive(appearance.discNumber)??track.disc,number:positive(appearance.trackNumber)??track.number});
      }catch(error){if(error instanceof CatalogError && /^(rate_limited|provider_http_40[13])/.test(error.code))throw error;errors.push({resource:id,code:error instanceof CatalogError?error.code:'track_fetch_failed'});}}
    const artwork=attributes.artwork?record(attributes.artwork):null;
    return {id:text(album.id),title:text(attributes.name),artists:await this.credits(album),url:providerLink(attributes.url,'music.apple.com'),
      type:attributes.isSingle===true?'single':attributes.isCompilation===true?'compilation':'album',...releaseDate(attributes.releaseDate,null),
      upc:optionalText(attributes.upc),trackCount:positive(attributes.trackCount),artwork:artwork?[{url:text(artwork.url),width:positive(artwork.width),height:positive(artwork.height)}]:[],
      tracks,excludedTracks:excluded,errors};
  }
}
