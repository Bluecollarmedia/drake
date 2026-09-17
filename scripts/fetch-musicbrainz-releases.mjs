import { readFile, writeFile } from 'node:fs/promises';
import { MusicBrainzClient, DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
const api = new MusicBrainzClient();
const basic = JSON.parse(await readFile(new URL('../artifacts/musicbrainz/discovered-releases.json', import.meta.url), 'utf8'));
const basicById = new Map(basic.map(r => [r.id,r]));
const expanded = await api.browse('release', { track_artist: DRAKE_MBID }, 'recordings+artist-credits', 20);
const references = expanded.map(r => ({ ...basicById.get(r.id), ...r, 'release-group':basicById.get(r.id)?.['release-group'] }));
const excluded = []; const selected = [];
for (const reference of references) {
  let reason;
  if (reference.status !== 'Official') reason = `release_status_${reference.status || 'unknown'}`;
  else if ((reference['release-group']?.['secondary-types'] || []).includes('DJ-mix')) reason = 'continuous_dj_mix_release';
  else if (/\b(bootleg|unofficial|karaoke|tribute)\b/i.test(`${reference.title} ${reference.disambiguation}`)) reason = 'unofficial_or_non_original_release';
  else if (reference.date && reference.date > new Date().toISOString().slice(0,10)) reason = 'future_release';
  if (reason) excluded.push({ id: reference.id, title: reference.title, reason }); else selected.push(reference);
}
console.log(`Selected ${selected.length}/${references.length} official non-DJ-mix releases.`);
await writeFile(new URL('../artifacts/musicbrainz/excluded-releases.json', import.meta.url), JSON.stringify(excluded));
const releases = []; const errors = [];
for (const [index, reference] of selected.entries()) {
  try {
    const complete = (reference.media || []).every(m => (m.tracks || []).length === m['track-count'] && (m['track-offset'] || 0) === 0);
    releases.push(complete ? reference : await api.get(`release/${reference.id}`, { inc: 'recordings+artist-credits+release-groups+labels' }));
  }
  catch (error) { errors.push({ id: reference.id, message: error.message }); }
  if ((index+1)%10===0 || index===selected.length-1) console.log(`Examined release ${index+1}/${selected.length}; ${errors.length} errors; ${api.requests} network requests, ${api.cacheHits} cached.`);
}
await writeFile(new URL('../artifacts/musicbrainz/releases.json', import.meta.url), JSON.stringify(releases));
await writeFile(new URL('../artifacts/musicbrainz/release-fetch-errors.json', import.meta.url), JSON.stringify(errors));
console.log(JSON.stringify({ fetched: releases.length, excluded: excluded.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
