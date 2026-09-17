import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
import { CanonicalCatalogStore } from '../server/catalog/store.ts';
let client;
try {
  client=await connectDatabase();await client.query('begin');
  // Run the real persistence SQL, substituting savepoints for per-release commits so ALL fixtures roll back.
  const scoped=new Proxy(client,{get(target,property){
    if(property==='query')return async(sql,values)=>{
      if(sql==='begin')return client.query('savepoint catalog_fixture');
      if(sql==='commit')return client.query('release savepoint catalog_fixture');
      if(sql==='rollback'){await client.query('rollback to savepoint catalog_fixture');return client.query('release savepoint catalog_fixture');}
      return client.query(sql,values);
    };
    return Reflect.get(target,property);
  }});
  const store=new CanonicalCatalogStore(scoped,'spotify','US');const suffix=randomUUID();
  const artist={id:`fixture-artist-${suffix}`,name:`Transactional fixture performer ${suffix}`,url:null};
  const title=`Transactional recording fixture ${suffix}`;
  const track={id:`fixture-recording-a-${suffix}`,title,artists:[artist],url:null,isrc:'ZZTST2600001',durationMs:200000,explicit:true,disc:1,number:1};
  const release={id:`fixture-release-a-${suffix}`,title:`Transactional release fixture A ${suffix}`,artists:[artist],url:null,type:'album',date:null,datePrecision:null,upc:null,artwork:[],trackCount:1,tracks:[track],excludedTracks:0,errors:[]};
  const first=await store.applyRelease(release);assert.equal(first.newSongs,1);
  const deluxe={...release,id:`fixture-release-b-${suffix}`,title:`Transactional release fixture B ${suffix}`,tracks:[{...track,id:`fixture-recording-b-${suffix}`}]};
  const second=await store.applyRelease(deluxe);assert.equal(second.newSongs,0);assert.equal(second.merged,1);
  for(const value of [release,deluxe]){const retry=await store.applyRelease(value);assert.equal(retry.newSongs,0);assert.equal(retry.newReleases,0);assert.equal(retry.reviews,0);}
  const canonical=(await client.query('select id from public.songs where title=$1',[title])).rows;
  assert.equal(canonical.length,1);
  assert.equal(Number((await client.query('select count(*) from public.release_tracks where song_id=$1',[canonical[0].id])).rows[0].count),2);
  const uncertain=await store.applyRelease({...release,id:`fixture-release-c-${suffix}`,tracks:[{...track,id:`fixture-uncertain-${suffix}`,isrc:null}]});
  assert.equal(uncertain.newSongs,1);assert(uncertain.reviews>=1);
  const live=await store.applyRelease({...release,id:`fixture-release-d-${suffix}`,tracks:[{...track,id:`fixture-live-${suffix}`,title:title+' (Live in Test Venue)'}]});
  assert.equal(live.newSongs,1);assert.equal(live.merged,0);
  await client.query('rollback');
  console.log(JSON.stringify({persistence_sql_verified:true,repeat_fixture_import_idempotent:true,multiple_releases_one_canonical_recording:true,uncertain_matches_flagged:true,live_version_not_merged:true,
    evidence_scope:'Synthetic persistence fixtures only; all rolled back. This is not evidence of a real provider import or real catalog coverage.'}));
}catch(error){await client?.query('rollback').catch(()=>{});console.error(`Catalog persistence verification failed (${error.code??error.message}).`);process.exitCode=1;}
finally{await client?.end();}
