import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parseCuratedMaster } from '../server/catalog/curated-master.mjs';
const source = new URL('../server/catalog/curated/drake-lead-master.txt', import.meta.url);
const master = parseCuratedMaster(await readFile(source, 'utf8'));
const output = new URL('../artifacts/curated-catalog/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL('parsed-master.json', output), JSON.stringify(master, null, 2));
console.log(JSON.stringify({ counts: master.counts, exactRepeatedText: master.exactRepeatedText, conflictingCandidates: master.conflictingCandidates, review: master.candidates.filter(c => c.explicitlyReview).map(c => ({ title: c.title, roles: c.roles, project: c.entries[0].project })) }, null, 2));
