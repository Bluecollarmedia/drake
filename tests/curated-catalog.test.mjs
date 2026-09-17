import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCuratedMaster } from '../server/catalog/curated-master.mjs';
import { enrichCuratedMaster } from '../server/catalog/curated-enrichment.mjs';
import { DRAKE_MBID } from '../server/catalog/musicbrainz-client.mjs';
const line=(title,role='Lead',version='Original')=>`"${title}" | Credit: Drake | Role: ${role} | ${version}`;
const drake={name:'Drake',artist:{id:DRAKE_MBID,name:'Drake'},joinphrase:''};
const release=(id,title,tracks)=>({id,title,status:'Official','release-group':{id:'g-'+id,title},media:[{position:1,'track-count':tracks.length,tracks:tracks.map((title,i)=>({id:id+'-'+i,title,position:i+1,length:200000,'artist-credit':[drake],recording:{id:id+'-r'+i,title,length:200000,'artist-credit':[drake],isrcs:[]}}))}]});
test('curated repeated release entries share candidates, but project-specific intros and declared remixes remain separate',()=>{
  const m=parseCuratedMaster(['PROJECT A (2020)',line('Intro'),line('Fixture'),'PROJECT B (2021)',line('Intro'),line('Fixture'),line('Fixture','Lead','Alternate / Remix')].join('\n'));
  assert.equal(m.counts.totalEntries,5);assert.equal(m.counts.uniqueCanonicalCandidates,4);
  assert.equal(m.candidates.filter(c=>c.title==='Intro').length,2);
});
test('curated metadata cannot add catalog members and Review candidates never automatically approve',()=>{
  const m=parseCuratedMaster(['PROJECT A (2020)',line('Fixture','Interlude / Review')].join('\n'));
  const p=enrichCuratedMaster(m,[],[release('a','Project A',['Fixture','Unlisted song'])]);
  assert.equal(p.enriched.length,1);assert.equal(p.enriched[0].status,'needs_review');assert.equal(p.enriched[0].appearances.length,1);
});
test('curated absent metadata preserves the candidate and supplied credit instead of removing or inventing metadata',()=>{
  const m=parseCuratedMaster(['PROJECT A (2020)',line('Unmatched')].join('\n'));
  const p=enrichCuratedMaster(m,[],[release('a','Project A',['Other song'])]);
  assert.equal(p.enriched[0].title,'Unmatched');assert.equal(p.enriched[0].entries[0].credit,'Drake');assert.equal(p.enriched[0].best,null);assert.equal(p.enriched[0].status,'needs_review');
});
test('curated exact title on the wrong project is held and source role discrepancies are explicit',()=>{
  const m=parseCuratedMaster(['PROJECT A (2020)',line('Fixture')].join('\n'));
  const p=enrichCuratedMaster(m,[],[release('b','Project B',['Fixture'])]);
  assert.equal(p.enriched[0].status,'needs_review');assert.equal(p.enriched[0].recordingIds.length,0);
});
test('curated ordinary song titles containing Live do not become excluded live-performance versions',()=>{
  const m=parseCuratedMaster(['PROJECT A (2020)',line('You Only Live Twice')].join('\n'));
  const p=enrichCuratedMaster(m,[],[release('a','Project A',['You Only Live Twice'])]);assert.equal(p.enriched[0].status,'approved');
});
test('feature candidate identity includes the primary artist, including same-title songs',()=>{
 const m=parseCuratedMaster(`2011\n"I'm on One" | Primary: DJ Khaled | Credit: DJ Khaled feat. Drake | Role: Feature | Original\n2022\n"I'm on One" | Primary: Future | Credit: Future feat. Drake | Role: Feature | Original`,'feature_guest');
 assert.equal(m.candidates.length,2);assert.equal(m.entries[1].primary,'Future');assert.equal(m.entries[1].year,2022);
});
test('review feature entries may omit version without inventing a verified version',()=>{
 const m=parseCuratedMaster('2022\n"Never Hating" | Primary: Lil Baby | Credit: Lil Baby feat. Young Thug | Role: REVIEW — verify Drake performance','feature_guest');
 assert.equal(m.candidates[0].explicitlyReview,true);assert.match(m.entries[0].versionNotes,/Unspecified/);
 assert.throws(()=>parseCuratedMaster('2022\n"Fixture" | Primary: Lil Baby | Credit: Lil Baby feat. Drake | Role: Feature','feature_guest'),/missing_master_version/);
});
test('feature title-only match cannot attach the Drake-primary same-title song',()=>{
 const m=parseCuratedMaster('2012\n"Amen" | Primary: Meek Mill | Credit: Meek Mill feat. Drake | Role: Feature | Original','feature_guest');
 const p=enrichCuratedMaster(m,[],[release('a','For All the Dogs',['Amen'])]);
 assert.equal(p.enriched[0].best,null);assert.equal(p.enriched[0].recordingIds.length,0);
});
test('feature requested remix excludes sped-up variants and unrelated lead artists',()=>{
 const m=parseCuratedMaster('2019\n"Fixture (Remix)" | Primary: Performer | Credit: Performer feat. Drake | Role: Feature | Alternate / Remix','feature_guest');
 const r=release('a','Fixture',['Fixture (Remix)','Fixture (Remix Sped Up)']);
 for(const t of r.media[0].tracks)t['artist-credit']=[{artist:{id:'performer',name:'Performer'},name:'Performer',joinphrase:' feat. '},drake];
 const p=enrichCuratedMaster(m,[],[r]);assert.equal(p.enriched[0].best.title,'Fixture (Remix)');assert.equal(p.enriched[0].appearances.length,1);
});
