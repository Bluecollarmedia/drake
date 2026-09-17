import type { CatalogTrack } from './types.ts';
export function normalizeName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('en-US').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
}
export function normalizeTitle(value: string) {
  // Remove explicit feature-credit suffixes only. Live/remix/alternate qualifiers stay in identity.
  return normalizeName(value).replace(/\s*\((?:feat\.?|ft\.?)\s+[^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();
}
export function versionKey(title: string) {
  const normalized=normalizeTitle(title);
  return /\b(live|remix|edit|acoustic|instrumental|demo|sped up|slowed|re-recorded|remaster)\b/.test(normalized) ? normalized : 'original';
}
export function normalizeIsrc(value: unknown) {
  if(typeof value!=='string')return null;
  const code=value.replace(/[-\s]/g,'').toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(code) ? code : null;
}
export interface RecordingCandidate {
  id: string; normalized_title: string; version_key: string; duration_ms: number | null; explicit: boolean | null;
  primary_artist_id: string | null; artist_ids: string[]; isrcs: string[];
}
export function isHighConfidenceMatch(track: CatalogTrack, artistIds: string[], candidate: RecordingCandidate) {
  return track.isrc !== null && candidate.isrcs.includes(track.isrc)
    && normalizeTitle(track.title)===candidate.normalized_title && versionKey(track.title)===candidate.version_key
    && artistIds[0]===candidate.primary_artist_id
    && [...new Set(artistIds)].sort().join('|')===[...new Set(candidate.artist_ids)].sort().join('|')
    && track.durationMs!==null && candidate.duration_ms!==null && Math.abs(track.durationMs-candidate.duration_ms)<=1000
    && track.explicit!==null && candidate.explicit!==null && track.explicit===candidate.explicit;
}
