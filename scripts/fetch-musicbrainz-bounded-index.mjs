import { readFile,writeFile } from 'node:fs/promises';
import { MusicBrainzClient,DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);const api=new MusicBrainzClient();
const raw=JSON.parse(await readFile(new URL('recordings.json',root),'utf8'));
const ids=[...new Set(raw.map(r=>r.id))].sort();const results=[];
async function batch(values){
  const query=`arid:${DRAKE_MBID} AND status:official AND rid:(${values.join(' OR ')})`;
  const page=await api.get('recording',{query,limit:100,offset:0});
  if(!Number.isInteger(page.count)||!Array.isArray(page.recordings))throw new Error('invalid_bounded_recording_search');
  if(page.count>100){if(values.length===1)throw new Error('recording_index_duplicate_document_overflow');const half=Math.ceil(values.length/2);await batch(values.slice(0,half));await batch(values.slice(half));return;}
  if(page.recordings.length!==page.count)throw new Error('incomplete_bounded_recording_search');
  if(page.recordings.some(r=>!values.includes(r.id)))throw new Error('recording_id_search_filter_not_applied');
  results.push(...page.recordings);
}
for(let offset=0;offset<ids.length;offset+=100){await batch(ids.slice(offset,offset+100));console.log(`Bounded official-recording discovery ${Math.min(offset+100,ids.length)}/${ids.length} source IDs; ${new Set(results.map(r=>r.id)).size} eligible IDs.`);}
const unique=[...new Map(results.map(r=>[r.id,r])).values()];
await writeFile(new URL('bounded-official-recordings.json',root),JSON.stringify(unique));
await writeFile(new URL('bounded-index-summary.json',root),JSON.stringify({sourceRecordingIds:ids.length,officialRecordingIds:unique.length,indexedDocuments:results.length,duplicateIndexedDocuments:results.length-unique.length,method:'Exact recording ID batches bounded below one search page; no relevance-offset pagination'},null,2));
console.log(JSON.stringify({officialRecordingIds:unique.length}));
