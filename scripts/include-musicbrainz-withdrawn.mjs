import { readFile,writeFile } from 'node:fs/promises';
import { MusicBrainzClient } from '../server/catalog/musicbrainz-client.mjs';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);const api=new MusicBrainzClient();
const read=name=>readFile(new URL(name,root),'utf8').then(JSON.parse);
const basic=await read('discovered-releases.json');const releases=await read('releases.json');const excluded=await read('excluded-releases.json');
const errors=await read('release-fetch-errors.json');const map=new Map(releases.map(r=>[r.id,r]));
// MusicBrainz defines Withdrawn as officially released, then actively withdrawn.
// Historical official releases remain in scope even when no longer available to play.
for(const reference of basic.filter(r=>r.status==='Withdrawn')){
  if((reference['release-group']?.['secondary-types']||[]).includes('DJ-mix'))continue;
  if(reference.date&&reference.date>new Date().toISOString().slice(0,10))continue;
  try{const release=await api.get(`release/${reference.id}`,{inc:'recordings+artist-credits+release-groups+labels'});if(release.status==='Withdrawn')map.set(release.id,release);}
  catch(error){errors.push({id:reference.id,message:error.message});}
}
await writeFile(new URL('releases.json',root),JSON.stringify([...map.values()]));
await writeFile(new URL('excluded-releases.json',root),JSON.stringify(excluded.filter(r=>!map.has(r.id))));
await writeFile(new URL('release-fetch-errors.json',root),JSON.stringify(errors));
console.log(JSON.stringify({historicalWithdrawnOfficialReleasesIncluded:[...map.values()].filter(r=>r.status==='Withdrawn').length,errors},null,2));if(errors.length)process.exitCode=1;
