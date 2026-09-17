// This command is intentionally restricted to the four user-authorized omissions.
import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { parseCuratedMaster,masterTitleKey } from '../server/catalog/curated-master.mjs';
import { enrichCuratedMaster } from '../server/catalog/curated-enrichment.mjs';
import { persistCuratedPlan } from '../server/catalog/curated-store.mjs';
import { DRAKE_MBID,MusicBrainzClient } from '../server/catalog/musicbrainz-client.mjs';
import { connectDatabase } from './lib/database.mjs';
const root=new URL('../artifacts/four-confirmed-features/',import.meta.url);
await mkdir(root,{recursive:true});
const rawText=await readFile(new URL('../server/catalog/curated/drake-four-confirmed-features.txt',import.meta.url),'utf8');
const master=parseCuratedMaster(rawText,'feature_guest');
assert.deepEqual(master.entries.map(e=>e.title),['The Zone','With You','Cabaret','Know Bout Me']);
const evidence={
 'The Zone':{recordingId:'91168a22-2f79-40bd-9c8d-8263f38cc6b9',url:'https://musicbrainz.org/recording/91168a22-2f79-40bd-9c8d-8263f38cc6b9',credit:'The Weeknd feat. Drake'},
 'With You':{recordingId:'d35aa3b0-8371-4ea4-a0ba-83baf489193d',url:'https://music.apple.com/us/song/1443110845',credit:'Lil Wayne feat. Drake'},
 'Cabaret':{recordingId:'fdae1add-570d-4869-b7e7-fdfb1bcfabc4',url:'https://music.apple.com/us/song/1441493341',credit:'Justin Timberlake feat. Drake'},
 'Know Bout Me':{recordingId:'c4d344ca-5c3a-4e77-964e-4baac8188fa9',url:'https://music.apple.com/us/song/1445291112',credit:'Timbaland feat. JAY Z, Drake & James Fauntleroy'},
};
const api=new MusicBrainzClient();
const raw=[];
for(const e of master.entries){
 const r=await api.get('recording/'+evidence[e.title].recordingId,{inc:'artist-credits+artist-rels+isrcs'});
 assert(r['artist-credit'].some(c=>c.artist?.id===DRAKE_MBID),'Verified performing credit required: '+e.title);
 assert(r['artist-credit'].some(c=>masterTitleKey(c.name)===masterTitleKey(e.primary)||masterTitleKey(c.artist?.name)===masterTitleKey(e.primary)));
 raw.push(r);
}
const ids=new Set(raw.map(r=>r.id));
// Existing cached release appearances, narrowed before enrichment to these exact recordings.
const releases=JSON.parse(await readFile(new URL('../artifacts/musicbrainz/releases.json',import.meta.url),'utf8')).map(r=>({...r,media:(r.media||[]).map(m=>({...m,sourceTotalTrackCount:m.sourceTotalTrackCount||m['track-count'],tracks:(m.tracks||[]).filter(t=>ids.has(t.recording?.id))})).filter(m=>m.tracks.length)})).filter(r=>r.media.length);
const plan=enrichCuratedMaster(master,raw,releases);
for(const c of plan.enriched){
 assert(c.best&&c.recordingIds.includes(evidence[c.title].recordingId),'Official appearance required: '+c.title);
 assert(c.appearances.every(t=>['Official','Withdrawn'].includes(t.releaseStatus)));
 c.performanceEvidence={...evidence[c.title],recording:raw.find(r=>r.id===evidence[c.title].recordingId)};
 // Resolve billing only for these four against their specific official featuring credits.
 for(const review of c.reviews.filter(r=>r.reason==='feature_list_conflicts_with_joint_primary_source_billing')){
  review.blocking=false;review.evidence.verifiedOfficialFeaturingCredit=evidence[c.title].credit;review.evidence.verificationURL=evidence[c.title].url;
 }
 assert(!c.reviews.some(r=>r.blocking),'A remaining blocking discrepancy must prevent this import: '+c.title);
 c.status='approved';
}
let client;
try{
 client=await connectDatabase();
 await client.query('begin');
 await client.query("select pg_advisory_xact_lock(hashtext('which-drake.catalog'))");
 const titles=master.entries.map(e=>masterTitleKey(e.title));
 const existing=(await client.query(`select s.id,s.title,s.version_key,s.duration_ms,
  (select jsonb_agg(jsonb_build_object('name',a.name,'externalId',p.provider_id,'role',c.role)) from public.song_artists c join public.artists a on a.id=c.artist_id left join public.artist_provider_ids p on p.artist_id=a.id and p.provider='musicbrainz' where c.song_id=s.id) artists,
  (select jsonb_agg(provider_id) from public.song_provider_ids where song_id=s.id and provider='musicbrainz') recording_ids
  from public.songs s where regexp_replace(lower(s.title),'[^[:alnum:]]','','g')=any($1)`,[titles])).rows;
 const results=[];
 const newCandidates=[];
 for(const c of plan.enriched){
  const primary=raw.find(r=>r.id===evidence[c.title].recordingId)['artist-credit'].find(a=>masterTitleKey(a.name)===masterTitleKey(c.entries[0].primary)||masterTitleKey(a.artist?.name)===masterTitleKey(c.entries[0].primary)).artist.id;
  const matched=existing.filter(s=>s.recording_ids?.some(id=>c.recordingIds.includes(id))||
   (masterTitleKey(s.title)===masterTitleKey(c.title)&&s.version_key==='original'&&s.artists?.some(a=>a.externalId===primary)&&s.artists?.some(a=>a.externalId===DRAKE_MBID)));
  assert(matched.length<=1,'Multiple existing candidates need explicit resolution: '+c.title);
  if(matched.length)results.push({song:c.title,primary:c.entries[0].primary,officialReleased:true,drakePerforms:true,action:'already exists; unchanged',songId:matched[0].id,evidence:evidence[c.title]});
  else{newCandidates.push(c);results.push({song:c.title,primary:c.entries[0].primary,officialReleased:true,drakePerforms:true,action:'imported',evidence:evidence[c.title]});}
 }
 // Savepoint adapter lets the established pipeline participate in this outer atomic transaction.
 const scoped=new Proxy(client,{get(t,p){if(p==='query')return async(sql,values)=>{
  if(sql==='begin')return client.query('savepoint four_song_import');
  if(sql==='commit')return client.query('release savepoint four_song_import');
  if(sql==='rollback'){await client.query('rollback to savepoint four_song_import');return client.query('release savepoint four_song_import');}
  return client.query(sql,values);
 };return Reflect.get(t,p);}});
 if(newCandidates.length){
  const subset={...plan,enriched:newCandidates,master:{...master,candidates:newCandidates,entries:master.entries.filter(e=>newCandidates.some(c=>c.key===e.candidateKey))}};
  const before=(await client.query('select id,to_jsonb(m) data from public.catalog_memberships m')).rows;
  const imported=await persistCuratedPlan(scoped,subset,{masterSlug:'drake-four-confirmed-features'});
  assert.equal(imported.newSongs,newCandidates.length);
  const after=(await client.query('select id,to_jsonb(m) data from public.catalog_memberships m where id=any($1)',[before.map(m=>m.id)])).rows;
  assert.deepEqual(after.sort((a,b)=>a.id.localeCompare(b.id)),before.sort((a,b)=>a.id.localeCompare(b.id)),'Existing memberships and review items must remain unchanged');
  for(const c of newCandidates){
   const id=imported.candidateIds[c.key];
   const stored=(await client.query('select title,catalog_type from public.songs where id=$1',[id])).rows[0];
   assert.equal(stored.title,c.title);assert.equal(stored.catalog_type,'official_released');
   assert((await client.query('select a.name from public.song_artists c join public.artist_provider_ids p on p.artist_id=c.artist_id join public.artists a on a.id=c.artist_id where c.song_id=$1 and p.provider=$2 and p.provider_id=$3',[id,'musicbrainz',DRAKE_MBID])).rows.length);
   // The specific official featuring credit resolves a community join-phrase discrepancy for this song only.
   await client.query(`update public.catalog_memberships set status='approved',performance_verified=true,metadata_summary=metadata_summary||$2::jsonb where id=$1`,[imported.membershipIds[c.key],JSON.stringify({performingCreditVerified:true,verificationSource:c.performanceEvidence.url,verifiedCredit:c.performanceEvidence.credit})]);
   results.find(r=>r.song===c.title).songId=id;
  }
 }
 await client.query('commit');
 const result={checkedAt:new Date().toISOString(),scope:'Only The Zone, With You (Lil Wayne), Cabaret and Know Bout Me',results,otherMembershipsUnchanged:true,noAI:true};
 await writeFile(new URL('latest-report.json',root),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
}catch(error){await client?.query('rollback').catch(()=>{});console.error('Four-song import failed: '+error.message);process.exitCode=1;}finally{await client?.end();}
