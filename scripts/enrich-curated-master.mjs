import { readFile, writeFile } from 'node:fs/promises';
import { parseCuratedMaster } from '../server/catalog/curated-master.mjs';
import { enrichCuratedMaster } from '../server/catalog/curated-enrichment.mjs';
const source=await readFile(new URL('../server/catalog/curated/drake-lead-master.txt',import.meta.url),'utf8');
const root=new URL('../artifacts/musicbrainz/',import.meta.url);
const read=n=>readFile(new URL(n,root),'utf8').then(JSON.parse);
const plan=enrichCuratedMaster(parseCuratedMaster(source),await read('recordings.json'),await read('releases.json'),await read('performance-review.json'));
await writeFile(new URL('../artifacts/curated-catalog/enriched-plan.json',import.meta.url),JSON.stringify(plan,null,2));
console.log(JSON.stringify({counts:plan.counts,holds:plan.enriched.filter(c=>c.status==='needs_review').map(c=>({title:c.title,project:c.entries[0].project,reasons:c.reviews.filter(r=>r.blocking).map(r=>r.reason)}))},null,2));
