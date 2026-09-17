import test from 'node:test';
import assert from 'node:assert/strict';
import { artistRoles, compareRecordings, canonicalize, recordingVersion } from '../server/catalog/musicbrainz-identity.mjs';
import { buildPlan } from '../server/catalog/musicbrainz-plan.mjs';
import { DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
const base={title:'Fixture recording',artists:[{id:'artist'}],version:'original',length:200000,isrcs:['ZZTST2600001'],groups:['release-group'],disambiguation:''};
test('MusicBrainz clean/explicit appearances consolidate using release-family evidence, preserving version distinctions',()=>{
  const clean={...base,id:'b',disambiguation:'clean album version',isrcs:['ZZTST2600002']};
  const explicit={...base,id:'a',disambiguation:'explicit, album version'};
  assert.equal(recordingVersion(clean),'original');assert.equal(recordingVersion(explicit),'original');
  assert.equal(compareRecordings(clean,explicit).merge,true);
  assert.equal(compareRecordings({...clean,version:'radio edit'},explicit).merge,false);
});
test('MusicBrainz shared recording codes cannot override conflicting performer or duration evidence',()=>{
  assert.equal(compareRecordings(base,{...base,artists:[{id:'other'}]}).merge,false);
  assert.equal(compareRecordings(base,{...base,length:240000}).merge,false);
  assert.equal(compareRecordings({...base,isrcs:[]},{...base,isrcs:[]}).review,true);
});
test('MusicBrainz canonicalization does not merge through an uncertain transitive bridge',()=>{
  const records=[{...base,id:'a',length:200000},{...base,id:'b',length:201000},{...base,id:'c',length:202000}];
  const result=canonicalize(records);assert.equal(result.clusters.length,2);assert(result.reviews.length>0);
});
test('MusicBrainz explicit feature join phrases distinguish features from joint primary credits',()=>{
  const credits=[{artist:{id:'lead',name:'Lead'},joinphrase:' feat. '},{artist:{id:'guest',name:'Guest'},joinphrase:' & '},{artist:{id:'guest2',name:'Guest 2'},joinphrase:''}];
  assert.deepEqual(artistRoles(credits).map(a=>a.role),['primary','featured','featured']);
  credits[0].joinphrase=' & ';assert.deepEqual(artistRoles(credits).map(a=>a.role),['primary','primary','primary']);
});
test('MusicBrainz discovers track-only Drake features and never includes writer-only relationships',()=>{
  const lead={artist:{id:'lead',name:'Fixture Lead'},name:'Fixture Lead',joinphrase:' feat. '};
  const guest={artist:{id:DRAKE_MBID,name:'Drake'},name:'Drake',joinphrase:''};
  const feature={id:'feature',title:'Fixture feature',length:200000,'artist-credit':[lead]};
  const writerOnly={id:'writer',title:'Fixture writer only',length:200000,'artist-credit':[lead],relations:[{type:'writer',artist:{id:DRAKE_MBID}}]};
  const release={id:'release',title:'Fixture release',status:'Official','artist-credit':[lead],'release-group':{id:'group'},media:[{position:1,'track-count':2,tracks:[{id:'track1',position:1,title:feature.title,'artist-credit':[lead,guest],recording:feature},{id:'track2',position:2,title:writerOnly.title,'artist-credit':[lead],recording:writerOnly}]}]};
  const plan=buildPlan([writerOnly],[release],[]);
  assert.equal(plan.clusters.length,1);assert.equal(plan.appearances.length,1);
  assert.equal(plan.clusters[0].members[0].source.performanceEvidence,'track_artist_credit');
  assert.equal(plan.clusters[0].members[0].artists.find(a=>a.id===DRAKE_MBID).role,'featured');
  assert.throws(()=>buildPlan([],[{...release,status:'Bootleg'}],[]),/ineligible_release_status/);
});
test('MusicBrainz declared clean/explicit album counterparts can retain an omitted collaborator without merging arbitrary credit conflicts',()=>{
  const explicit={...base,disambiguation:'explicit',artists:[{id:'artist'},{id:'guest'}]};
  const clean={...base,disambiguation:'clean',isrcs:['ZZTST2600002'],length:200012};
  assert.equal(compareRecordings(explicit,clean).merge,true);
  assert.equal(compareRecordings({...explicit,disambiguation:''},{...clean,disambiguation:''}).merge,false);
});
test('MusicBrainz missing recording codes consolidate only with near-exact matching album track position evidence',()=>{
  const a={...base,isrcs:[],positions:['group:1:2']};const b={...base,length:200100,positions:['group:1:2']};
  assert.equal(compareRecordings(a,b).merge,true);
  assert.equal(compareRecordings(a,{...b,positions:['group:1:3']}).merge,false);
  assert.equal(compareRecordings({...a,isrcs:['ZZTST2600002']},b).merge,false);
});
