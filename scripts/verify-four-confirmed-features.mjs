import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { connectDatabase } from './lib/database.mjs';
const root=new URL('../artifacts/four-confirmed-features/',import.meta.url);
const report=JSON.parse(await readFile(new URL('latest-report.json',root),'utf8'));
assert.equal(report.results.length,4);
let client;
try{
 client=await connectDatabase();
 const ids=report.results.map(r=>r.songId);
 const songs=(await client.query(`select s.id,s.title,m.status,m.performance_verified,
  exists(select 1 from public.released_catalog_eligible_songs e where e.id=s.id) eligible,
  (select count(*)::int from public.release_tracks t where t.song_id=s.id) appearances
  from public.songs s join public.catalog_memberships m on m.song_id=s.id and m.active and m.scope='feature_guest' where s.id=any($1)`,[ids])).rows;
 assert.equal(songs.length,4);
 for(const s of songs){assert.equal(s.status,'approved');assert.equal(s.performance_verified,true);assert.equal(s.eligible,true);assert(s.appearances>0);}
 for(const r of report.results){assert.equal((await client.query("select count(*)::int n from public.song_provider_ids where provider='musicbrainz' and provider_id=$1 and song_id=$2",[r.evidence.recordingId,r.songId])).rows[0].n,1);}
 const verified={checkedAt:new Date().toISOString(),songs,eachRecordingMapsToExactlyOneCanonicalSong:true,scope:'Only the four authorized recordings'};
 await writeFile(new URL('verification.json',root),JSON.stringify(verified,null,2));
 await writeFile(new URL('initial-import-report.json',root),JSON.stringify(report,null,2));
 console.log(JSON.stringify(verified,null,2));
}finally{await client?.end();}
