import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from './lib/database.mjs';
import { SpotifyCatalogAdapter } from '../server/catalog/spotify.ts';
import { AppleCatalogAdapter } from '../server/catalog/apple.ts';
import { CanonicalCatalogStore } from '../server/catalog/store.ts';
console.error('Legacy discovery-driven provider import is paused. Use curated master lists for membership; preserved Spotify/Apple adapters may enrich supplied candidates later.');
process.exit(1);
const provider=process.argv[2]??'spotify';const market=process.argv[3]??(provider==='apple'?'us':'US');
let client;let runId;let adapter;
try {
  let credentials={};try{credentials=JSON.parse((await readFile(new URL('../.secrets/catalog.local.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(provider==='spotify')adapter=new SpotifyCatalogAdapter(credentials.spotify_client_id,credentials.spotify_client_secret,market);
  else if(provider==='apple')adapter=new AppleCatalogAdapter(credentials.apple_developer_token,market);
  else throw new Error('unsupported_catalog_provider');
  client=await connectDatabase();
  if(!(await client.query("select pg_try_advisory_lock(hashtext('which-drake.catalog')) acquired")).rows[0].acquired)throw new Error('another_catalog_import_is_running');
  const store=new CanonicalCatalogStore(client,provider,market);
  runId=randomUUID();await client.query('insert into public.catalog_imports(id,provider,coverage) values($1,$2,$3)',[runId,provider,JSON.stringify(adapter.coverage)]);
  const target=await adapter.verifyTarget();await store.pinTarget(target);
  const references=await adapter.listReleases();
  const report={run_id:runId,provider,market,coverage:adapter.coverage,listed_releases:references.length,processed_releases:0,processed_appearances:0,new_releases:0,new_canonical_songs:0,
    duplicates_merged:0,new_duplicate_reviews:0,excluded_uncredited_or_non_song_tracks:0,metadata_drift:[],errors:[]};
  for(const reference of references) {
    try {
      const release=await adapter.fetchRelease(reference);
      const delta=await store.applyRelease(release);report.processed_releases++;report.processed_appearances+=delta.appearances;report.new_releases+=delta.newReleases;
      report.new_canonical_songs+=delta.newSongs;report.duplicates_merged+=delta.merged;report.new_duplicate_reviews+=delta.reviews;
      report.excluded_uncredited_or_non_song_tracks+=release.excludedTracks;report.metadata_drift.push(...delta.metadataDrift);report.errors.push(...release.errors);
    }catch(error){if(/^(rate_limited|provider_http_40[13])/.test(error.code??''))throw error;report.errors.push({resource:reference.id,code:error.code??'release_import_failed'});}
    console.log(`Processed ${report.processed_releases}/${references.length} releases; ${report.errors.length} reported errors.`);
  }
  const final={...report,status:report.errors.length?'partial':'completed',statistics:await store.statistics(),
    duplicate_definition:'New provider recording IDs consolidated into an existing canonical song using ISRC + title + artist set/order + version + duration + explicit checks. Existing uncertain song rows are never destructively merged.'};
  await client.query('update public.catalog_imports set completed_at=now(),status=$2,report=$3 where id=$1',[runId,final.status,JSON.stringify(final)]);
  await mkdir(new URL('../artifacts/catalog-imports/',import.meta.url),{recursive:true});
  await writeFile(new URL(`../artifacts/catalog-imports/${runId}.json`,import.meta.url),JSON.stringify(final,null,2));
  console.log(JSON.stringify(final,null,2));if(report.errors.length)process.exitCode=1;
}catch(error){
  const code=error.code??error.message??'catalog_import_failed';
  if(client&&runId)await client.query("update public.catalog_imports set completed_at=now(),status='failed',report=$2 where id=$1",[runId,JSON.stringify({error:code,coverage:adapter?.coverage})]).catch(()=>{});
  console.error(`Catalog import stopped: ${code}. No successful import is claimed.`);process.exitCode=2;
}finally{await client?.end();}
