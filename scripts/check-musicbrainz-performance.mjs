import { readFile,writeFile } from 'node:fs/promises';
import { MusicBrainzClient,DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);const api=new MusicBrainzClient();
const raw=JSON.parse(await readFile(new URL('recordings.json',root),'utf8'));
const candidates=raw.filter(r=>/interlude|instrumental|\b4422\b|yebba/i.test(r.title));
const results=[];
for(const recording of candidates){
  const full=await api.get(`recording/${recording.id}`,{inc:'artist-rels+artist-credits+isrcs'});
  const relations=(full.relations||[]).filter(r=>r.artist);
  const vocal=relations.filter(r=>['vocal','spoken vocals','rap'].includes(r.type));
  const drakePerformance=relations.filter(r=>r.artist.id===DRAKE_MBID&&['vocal','spoken vocals','rap','performer','instrument'].includes(r.type));
  const otherVocals=vocal.filter(r=>r.artist.id!==DRAKE_MBID);
  const hold=!drakePerformance.length&&otherVocals.length>0;
  results.push({recordingId:recording.id,title:recording.title,drakePerformanceConfirmed:drakePerformance.length>0,heldForPerformanceReview:hold,reason:hold?'vocal_relationships_list_only_other_performers_drake_credit_may_be_release_branding':null,
    vocalPerformers:vocal.map(r=>({id:r.artist.id,name:r.artist.name,type:r.type,attributes:r.attributes})),drakeRelationships:relations.filter(r=>r.artist.id===DRAKE_MBID).map(r=>({type:r.type,attributes:r.attributes})),evidenceURL:`https://musicbrainz.org/recording/${recording.id}`});
  console.log(`Performance metadata checked ${results.length}/${candidates.length}.`);
}
await writeFile(new URL('performance-review.json',root),JSON.stringify(results,null,2));
console.log(JSON.stringify({checked:results.length,holds:results.filter(r=>r.heldForPerformanceReview)},null,2));
