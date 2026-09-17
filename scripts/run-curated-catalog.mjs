import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Only the supplied master list defines candidates. Reads cached metadata by default.
// No artist-wide network discovery, AI endpoint or analyzer is part of this command.
const part2=process.argv.includes('--part2');
const scripts=part2?['prepare-curated-features.mjs']:['parse-curated-master.mjs','enrich-curated-master.mjs'];
if(!process.argv.includes('--plan-only'))scripts.push(part2?'import-curated-features.mjs':'import-curated-master.mjs');
for(const script of scripts){
  const args=script==='import-curated-features.mjs'?['--apply']:[];
  const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[fileURLToPath(new URL(script,import.meta.url)),...args],{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',resolve);});
  if(code!==0){process.exitCode=1;break;}
}
