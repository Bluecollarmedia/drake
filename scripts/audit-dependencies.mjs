import {execFileSync,execSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
let raw;
try{raw=process.platform==='win32'?execSync('npm audit --json',{encoding:'utf8',maxBuffer:20_000_000}):execFileSync('npm',['audit','--json'],{encoding:'utf8',maxBuffer:20_000_000});}
catch(problem){raw=String(problem.stdout||'');if(!raw)throw problem;}
const report=JSON.parse(raw),counts=report.metadata?.vulnerabilities||{};
const summary={...counts,passed:Number(counts.critical||0)===0&&Number(counts.high||0)===0,note:'Moderate advisories remain documented; incompatible forced downgrades are not applied automatically.'};
await mkdir(new URL('../artifacts/security/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security/npm-audit.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(summary,null,2));if(!summary.passed)process.exitCode=1;
