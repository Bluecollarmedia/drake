import { readFile, writeFile, readdir } from 'node:fs/promises';
import { MusicBrainzClient } from '../server/catalog/musicbrainz-client.mjs';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);const api=new MusicBrainzClient();
const indexed=JSON.parse(await readFile(new URL('bounded-official-recordings.json',root),'utf8'));
await writeFile(new URL('indexed-official-recordings.json',root),JSON.stringify(indexed));
const basic=JSON.parse(await readFile(new URL('discovered-releases.json',root),'utf8'));const basicMap=new Map(basic.map(r=>[r.id,r]));
const releases=new Map();const exclusions=[];
const eligible=release=>release.status==='Official'&&!(release['release-group']?.['secondary-types']||[]).includes('DJ-mix')&&!/\b(bootleg|unofficial|karaoke|tribute)\b/i.test(`${release.title} ${release.disambiguation||''}`)&&(!release.date||release.date<=new Date().toISOString().slice(0,10));
for(const recording of indexed){
  for(const appearance of recording.releases||[]){
    const reference={...appearance,...basicMap.get(appearance.id)};
    if(!eligible(reference))continue;
    const release=releases.get(reference.id)||{...reference,media:[],targetedTrackListing:true};
    for(const m of appearance.media||[]){
      let medium=release.media.find(x=>x.position===m.position);
      if(!medium){medium={position:m.position,format:m.format,tracks:[],'track-count':0,sourceTotalTrackCount:m['track-count']};release.media.push(medium);}
      for(const [index,track] of (m.track||[]).entries()){
        if(!Number.isInteger(m['track-offset']))throw new Error(`missing_indexed_track_position:${appearance.id}:${track.id}`);
        const number=/^\d+$/.test(track.number||'')?Number(track.number):m['track-offset']+index+1;
        if(!medium.tracks.some(t=>t.id===track.id))medium.tracks.push({...track,position:number,recording,creditSource:'recording_artist_credit_in_indexed_appearance'});
      }
      medium['track-count']=medium.tracks.length;
    }
    releases.set(reference.id,release);
  }
}
// Reuse complete track-credit listings already obtained, without refetching them.
let completeCached=0;
for(const file of await readdir(new URL('cache/',root))){
  if(!file.endsWith('.json'))continue;
  const cached=JSON.parse(await readFile(new URL(`cache/${file}`,root),'utf8'));
  const candidates=cached.body.releases||((cached.url.includes('/release/')&&cached.body.id)?[cached.body]:[]);
  for(const item of candidates){
    if(!item.media?.some(m=>Array.isArray(m.tracks)))continue;
    const release={...basicMap.get(item.id),...item,'release-group':item['release-group']||basicMap.get(item.id)?.['release-group']};
    if(!eligible(release))continue;
    if(!(release.media||[]).every(m=>(m.tracks||[]).length===m['track-count']&&(m['track-offset']||0)===0))continue;
    if(!releases.get(item.id)||releases.get(item.id).targetedTrackListing){releases.set(item.id,release);completeCached++;}
  }
}
const missingReferences=basic.filter(eligible).filter(r=>!releases.has(r.id));
console.log(`Indexed ${indexed.length} recordings; ${releases.size} eligible release listings; ${completeCached} full cached track-credit listings; ${missingReferences.length} release IDs need lookup.`);
const errors=[];
for(const [index,reference] of missingReferences.entries()){
  try{
    let full;
    try{full=await api.get(`release/${reference.id}`,{inc:'recordings+artist-credits+release-groups+labels'});}
    catch(error){
      console.log(`Retrying ${reference.id} with a lighter track-credit lookup after ${error.message}.`);
      const listing=await api.get(`release/${reference.id}`,{inc:'recordings+artist-credits'});full={...reference,...listing,'release-group':reference['release-group']};
    }
    if(eligible(full))releases.set(full.id,full);
  }
  catch(error){errors.push({id:reference.id,message:error.message});}
  if((index+1)%10===0)console.log(`Checked index-absent release ${index+1}/${missingReferences.length}; ${errors.length} errors.`);
}
for(const reference of basic)if(!eligible(reference))exclusions.push({id:reference.id,title:reference.title,reason:reference.status!=='Official'?`release_status_${reference.status||'unknown'}`:(reference['release-group']?.['secondary-types']||[]).includes('DJ-mix')?'continuous_dj_mix_release':'unofficial_non_original_or_future_release'});
await writeFile(new URL('releases.json',root),JSON.stringify([...releases.values()]));
await writeFile(new URL('excluded-releases.json',root),JSON.stringify(exclusions));
await writeFile(new URL('release-fetch-errors.json',root),JSON.stringify(errors));
await writeFile(new URL('index-discovery-summary.json',root),JSON.stringify({indexedRecordings:indexed.length,eligibleReleaseListings:releases.size,fullTrackCreditListings:[...releases.values()].filter(r=>!r.targetedTrackListing).length,targetedIndexedAppearanceListings:[...releases.values()].filter(r=>r.targetedTrackListing).length,indexAbsentReleaseLookups:missingReferences.length,errors},null,2));
console.log(JSON.stringify({releases:releases.size,errors},null,2));if(errors.length)process.exitCode=1;
