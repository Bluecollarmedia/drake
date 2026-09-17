import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const DRAKE_MBID = '9fff2f8a-21e6-47de-a2b8-7f449929d43f';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export class MusicBrainzClient {
  constructor({ cacheRoot = new URL('../../artifacts/musicbrainz/cache/', import.meta.url), userAgent = process.env.MUSICBRAINZ_USER_AGENT || 'WhichDrake/0.2.0 (catalog maintainer: drakematcher@gmail.com)' } = {}) {
    this.cacheRoot = cacheRoot; this.userAgent = userAgent; this.lastRequest = 0; this.requests = 0; this.cacheHits = 0;this.pending=Promise.resolve();
  }
  get(entity,parameters={}){
    const task=this.pending.then(()=>this.request(entity,parameters));this.pending=task.catch(()=>{});return task;
  }
  async request(entity, parameters = {}) {
    const url = new URL(`https://musicbrainz.org/ws/2/${entity}`);
    for (const [key, value] of Object.entries({ ...parameters, fmt: 'json' })) url.searchParams.set(key, key === 'inc' ? String(value).replaceAll('+', ' ') : String(value));
    url.searchParams.sort();
    const key = createHash('sha256').update(url.href).digest('hex');
    await mkdir(this.cacheRoot, { recursive: true });
    const path = new URL(`${key}.json`, this.cacheRoot);
    try { const cached = JSON.parse(await readFile(path, 'utf8')); if(process.env.MUSICBRAINZ_REFRESH_CACHE!=='1'){this.cacheHits++;return cached.body;} }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (let attempt = 0; attempt < 6; attempt++) {
      await pause(Math.max(0, 1500 - (Date.now() - this.lastRequest)));
      this.lastRequest = Date.now(); this.requests++;
      let response;
      try{response = await fetch(url, { headers: { 'User-Agent': this.userAgent, Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });}
      catch(error){this.lastRequest=Date.now();if(attempt===5)throw error;await pause(2000*2**attempt);continue;}
      if (response.ok) {
        const body = await response.json(); const entry = { url: url.href, fetchedAt: new Date().toISOString(), body };
        const temp = new URL(`${key}.tmp`, this.cacheRoot);
        await writeFile(temp, JSON.stringify(entry)); await rename(temp, path); this.lastRequest=Date.now();return body;
      }
      const retryAfter = response.headers.get('retry-after'); await response.body?.cancel();this.lastRequest=Date.now();
      if (![429, 500, 502, 503, 504].includes(response.status)) throw new Error(`musicbrainz_http_${response.status}:${url.href}`);
      const numeric = Number(retryAfter); const wait = Math.max(2000 * 2 ** attempt, retryAfter ? (Number.isFinite(numeric) ? numeric * 1000 : Math.max(0, Date.parse(retryAfter) - Date.now())) : 0);
      console.log(`MusicBrainz ${entity} throttled/unavailable (${response.status}); backing off ${wait}ms.`);
      if(attempt===5)break;
      // Short intervals let an interrupted process stop promptly; only one request is in flight.
      for (let left = Math.max(1150, wait); left > 0; left -= 1000) await pause(Math.min(1000, left));
    }
    throw new Error(`musicbrainz_retries_exhausted:${url.href}`);
  }
  async browse(entity, link, includes = '', limit = 100) {
    const items = []; let offset = 0; let total = Infinity;
    while (offset < total) {
      const page = await this.get(entity, { ...link, ...(includes ? { inc: includes } : {}), limit, offset });
      const list = page[`${entity}s`]; total = page[`${entity}-count`];
      if (!Array.isArray(list) || !Number.isInteger(total)) throw new Error(`invalid_musicbrainz_page:${entity}`);
      items.push(...list); if (!list.length && offset < total) throw new Error(`incomplete_musicbrainz_page:${entity}`);
      offset += list.length;
      console.log(`MusicBrainz ${entity}: ${offset}/${total}.`);
    }
    if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error(`duplicate_musicbrainz_browse_pages:${entity}`);
    return items;
  }
  async search(entity, query) {
    const items=[];let offset=0;let total=Infinity;
    while(offset<total){
      const page=await this.get(entity,{query,limit:100,offset});const list=page[`${entity}s`];total=page.count;
      if(!Array.isArray(list)||!Number.isInteger(total)||(!list.length&&offset<total))throw new Error(`invalid_musicbrainz_search_page:${entity}`);
      items.push(...list);offset+=list.length;console.log(`MusicBrainz indexed ${entity}: ${offset}/${total}.`);
    }
    if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error(`duplicate_musicbrainz_search_pages:${entity}`);
    return items;
  }
}
