import assert from 'node:assert/strict';
import test from 'node:test';
import { isHighConfidenceMatch,normalizeIsrc,normalizeTitle,versionKey,type RecordingCandidate } from '../server/catalog/identity.ts';
import { safeProviderUrl,releaseDate } from '../server/catalog/http.ts';
import type { CatalogTrack } from '../server/catalog/types.ts';
// Synthetic identity fixtures only; no catalog metadata or AI analysis is seeded.
const track:CatalogTrack={id:'test-recording',title:'Test Recording (feat. Test Guest)',artists:[],url:null,isrc:'ZZTST2600001',durationMs:200000,explicit:true,disc:1,number:1};
const candidate:RecordingCandidate={id:'test-canonical',normalized_title:'test recording',version_key:'original',duration_ms:200400,explicit:true,primary_artist_id:'primary',artist_ids:['primary','guest'],isrcs:['ZZTST2600001']};
test('matching recording codes consolidate only with matching title/version/credits/duration/explicit evidence',()=>{
  assert(isHighConfidenceMatch(track,['primary','guest'],candidate));
  for(const changed of [{isrc:null},{title:'Test Recording (Live)'},{durationMs:220000},{explicit:false}])assert.equal(isHighConfidenceMatch({...track,...changed},['primary','guest'],candidate),false);
  assert.equal(isHighConfidenceMatch(track,['different','guest'],candidate),false);
  assert.equal(isHighConfidenceMatch(track,['primary'],candidate),false);
  assert.equal(isHighConfidenceMatch(track,['primary','guest'],{...candidate,explicit:null}),false);
});
test('uncertain title matches never substitute for recording evidence',()=>{
  assert.equal(isHighConfidenceMatch({...track,isrc:null},['primary','guest'],candidate),false);
  assert.equal(isHighConfidenceMatch({...track,durationMs:null},['primary','guest'],candidate),false);
});
test('normalization preserves distinct version descriptors',()=>{
  assert.equal(normalizeTitle(' Test   Recording (feat. Guest) '),'test recording');
  assert.notEqual(versionKey('Test Recording (Live in London)'),versionKey('Test Recording (Live in Paris)'));
  assert.notEqual(normalizeTitle('Test Recording - Remix'),normalizeTitle('Test Recording'));
  assert.equal(normalizeIsrc('ZZ-TST-26-00001'),'ZZTST2600001');
  assert.equal(normalizeIsrc('invalid'),null);
});
test('pagination cannot forward provider credentials to an unrelated origin',()=>{
  assert.throws(()=>safeProviderUrl('https://evil.test/v1/albums','https://api.spotify.com'));
  assert.throws(()=>safeProviderUrl('http://api.spotify.com/v1/albums','https://api.spotify.com'));
  assert.equal(safeProviderUrl('/v1/albums?offset=10','https://api.spotify.com').origin,'https://api.spotify.com');
});
test('partial release dates preserve provider precision and invalid dates stay unknown',()=>{
  assert.deepEqual(releaseDate('2011','year'),{date:'2011-01-01',datePrecision:'year'});
  assert.deepEqual(releaseDate('2011-11','month'),{date:'2011-11-01',datePrecision:'month'});
  assert.deepEqual(releaseDate('2011-02-30','day'),{date:null,datePrecision:null});
});
