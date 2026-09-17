import { readFile, writeFile } from 'node:fs/promises';
import { MusicBrainzClient } from '../server/catalog/musicbrainz-client.mjs';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);
const releases=JSON.parse(await readFile(new URL('releases.json',root),'utf8'));
const api=new MusicBrainzClient();
// Four targeted project lookups, not artist-wide discovery. This exposes guest-only tracks
// and verifies disputed early mixtape titles against the actual source tracklist.
for(const title of ['Room for Improvement','Comeback Season','So Far Gone','Her Loss']){
  const reference=releases.filter(r=>r['release-group']?.title===title).sort((a,b)=>Number(a.targetedTrackListing)-Number(b.targetedTrackListing))[0];
  if(!reference)throw new Error(`missing_targeted_project_reference:${title}`);
  if(!reference.targetedTrackListing)continue;
  const full=await api.get(`release/${reference.id}`,{inc:'recordings+artist-credits+release-groups+labels'});
  if(!['Official','Withdrawn'].includes(full.status))throw new Error(`project_status_changed:${title}`);
  if(!full.media?.every(m=>m.tracks?.length===m['track-count']))throw new Error(`incomplete_project:${title}`);
  releases[releases.findIndex(r=>r.id===reference.id)]=full;
  console.log(`Verified full source tracklist: ${title}.`);
}
await writeFile(new URL('releases.json',root),JSON.stringify(releases));
