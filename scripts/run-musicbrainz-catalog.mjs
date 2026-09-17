import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdir,open,readFile,unlink } from 'node:fs/promises';
console.error('Discovery-driven catalog import is paused. Curated master lists determine membership; use the curated importer. Existing source tools and cache are preserved.');
process.exit(1);
const root=new URL('../artifacts/musicbrainz/',import.meta.url);const lock=new URL('pipeline.lock',root);
await mkdir(root,{recursive:true});
let handle;
try{
  try{handle=await open(lock,'wx');}
  catch(error){
    if(error.code!=='EEXIST')throw error;
    const previous=JSON.parse(await readFile(lock,'utf8'));let alive=true;
    try{process.kill(previous.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else throw e;}
    if(alive)throw new Error('another_musicbrainz_pipeline_is_running');
    await unlink(lock);handle=await open(lock,'wx');
  }
  await handle.writeFile(JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));
  const env={...process.env,...(process.argv.includes('--refresh')?{MUSICBRAINZ_REFRESH_CACHE:'1'}:{})};
  const scripts=process.argv.includes('--snapshot-only')?[]:['discover-musicbrainz.mjs','fetch-musicbrainz-bounded-index.mjs','fetch-musicbrainz-index.mjs','include-musicbrainz-withdrawn.mjs','check-musicbrainz-performance.mjs'];
  scripts.push('import-musicbrainz.mjs');if(!process.argv.includes('--plan-only'))scripts.push('report-musicbrainz.mjs');
  for(const script of scripts){
    const args=[fileURLToPath(new URL(script,import.meta.url))];
    if(script==='import-musicbrainz.mjs'&&process.argv.includes('--plan-only'))args.push('--plan-only');
    const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',env,windowsHide:true});child.on('error',reject);child.on('exit',resolve);});
    if(code!==0)throw new Error(`${script}_failed_${code}`);
  }
}catch(error){console.error(error.message);process.exitCode=1;}
finally{if(handle){await handle.close();await unlink(lock);}}
