import {execFileSync} from 'node:child_process';
import {Buffer} from 'node:buffer';
import {readdir,readFile,stat,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const patterns=[
 {name:'OpenAI API key',re:/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g},
 {name:'Supabase secret key',re:/sb_secret_[A-Za-z0-9_-]{30,}/g},
 {name:'private key material',re:/-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/g},
 {name:'credentialed database URL',re:/postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/g},
];
const excluded=new Set(['node_modules','.git','.secrets','artifacts','.expo']);
const files=[];async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(excluded.has(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())await walk(full);else if(entry.isFile()&&(await stat(full)).size<10_000_000)files.push(full);}}
await walk(root);const findings=[];
function legacyServiceJwt(text){for(const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)??[]){try{const payload=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString('utf8'));if(payload.role==='service_role')return true;}catch{}}return false;}
const hermesc=path.join(root,'node_modules','hermes-compiler','hermesc','win64-bin','hermesc.exe');
for(const file of files){let body;try{body=path.extname(file)==='.hbc'?execFileSync(hermesc,['-b','-dump-bytecode',file],{encoding:'utf8',maxBuffer:100_000_000}):await readFile(file,'utf8');}catch{continue;}const relative=path.relative(root,file).replaceAll('\\','/');if(relative==='scripts/scan-production-secrets.mjs')continue;for(const pattern of patterns){pattern.re.lastIndex=0;if(pattern.re.test(body))findings.push({scope:'workspace',type:pattern.name,file:relative});}if(legacyServiceJwt(body))findings.push({scope:'workspace',type:'Supabase legacy service-role JWT',file:relative});}
let history='';try{history=execFileSync('git',['log','--all','-p','--no-ext-diff'],{cwd:root,encoding:'utf8',maxBuffer:50_000_000});}catch{}
for(const pattern of patterns){pattern.re.lastIndex=0;if(pattern.re.test(history))findings.push({scope:'git_history',type:pattern.name,file:null});}
if(legacyServiceJwt(history))findings.push({scope:'git_history',type:'Supabase legacy service-role JWT',file:null});
const localSecretFiles=await readdir(path.join(root,'.secrets')).catch(()=>[]);
const report={scannedFiles:files.length,gitHistoryScanned:history.length>0,excludedSecretDirectory:true,
 findings,localIgnoredSecretFiles:localSecretFiles,passed:findings.length===0,
 note:'Values are never written to this report. EXPO_PUBLIC Supabase publishable keys are intentionally public and are not classified as secrets.'};
await mkdir(path.join(root,'artifacts','security'),{recursive:true});await writeFile(path.join(root,'artifacts','security','secret-scan.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
