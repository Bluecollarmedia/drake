import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
import { buildPlan } from '../server/catalog/musicbrainz-plan.mjs';
import { persistMusicBrainzPlan } from '../server/catalog/musicbrainz-store.mjs';
import { DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
let db;
try {
  db=await connectDatabase();await db.query('begin');
  const wrapped=new Proxy(db,{get(target,key){if(key==='query')return (sql,...args)=>{
    if(sql==='begin')return target.query('savepoint musicbrainz_fixture');
    if(sql==='commit')return target.query('release savepoint musicbrainz_fixture');
    if(sql==='rollback')return target.query('rollback to savepoint musicbrainz_fixture');
    return target.query(sql,...args);
  };const value=target[key];return typeof value==='function'?value.bind(target):value;}});
  const id=randomUUID();const credit=[{artist:{id:DRAKE_MBID,name:'Drake'},name:'Drake',joinphrase:''}];
  const recording={id,title:'MusicBrainz rollback fixture only',length:200000,'artist-credit':credit,isrcs:['ZZTST2600001']};
  const releases=[1,2].map(index=>({id:randomUUID(),title:`Fixture release ${index}`,status:'Official',date:'2020-01-01','artist-credit':credit,'release-group':{id:randomUUID(),'primary-type':'Album','secondary-types':[]},media:[{position:1,'track-count':1,tracks:[{id:randomUUID(),position:1,title:recording.title,length:200000,'artist-credit':credit,recording}]}]}));
  const plan=buildPlan([recording],releases,[]);
  const first=await persistMusicBrainzPlan(wrapped,plan);const second=await persistMusicBrainzPlan(wrapped,plan);
  assert.equal(first.newSongs,1);assert.equal(second.newSongs,0);assert.equal(second.newReleases,0);
  const songId=first.canonicalIds[id];const {rows}=await db.query('select count(*)::int count from public.release_tracks where song_id=$1',[songId]);assert.equal(rows[0].count,2);
  assert.equal(first.canonicalIds[id],second.canonicalIds[id]);
  console.log(JSON.stringify({musicbrainz_bulk_sql_verified:true,repeat_writes_preserve_uuid:true,two_appearances_one_fixture_song:true,fixtures:'Synthetic test metadata only; outer transaction rolled back.'}));
}finally{if(db){await db.query('rollback');await db.end();}}
