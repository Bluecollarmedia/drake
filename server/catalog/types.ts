export type Provider = 'spotify' | 'apple';
export interface CatalogArtist { id: string; name: string; url: string | null }
export interface CatalogTrack {
  id: string; title: string; artists: CatalogArtist[]; url: string | null; isrc: string | null;
  durationMs: number | null; explicit: boolean | null; disc: number; number: number;
}
export interface CatalogRelease {
  id: string; title: string; artists: CatalogArtist[]; url: string | null; type: 'album' | 'mixtape' | 'ep' | 'single' | 'compilation' | 'unknown';
  date: string | null; datePrecision: 'day' | 'month' | 'year' | null; upc: string | null;
  artwork: { url: string; width: number | null; height: number | null }[];
  trackCount: number | null; tracks: CatalogTrack[]; excludedTracks: number; errors: { resource: string; code: string }[];
}
export interface ReleaseReference { id: string; groups: string[] }
export interface CatalogAdapter {
  provider: Provider; market: string; targetArtistId: string; coverage: Record<string, unknown>;
  verifyTarget(): Promise<CatalogArtist>;
  listReleases(): Promise<ReleaseReference[]>;
  fetchRelease(reference: ReleaseReference): Promise<CatalogRelease>;
}
