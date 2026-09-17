import { setTimeout as delay } from 'node:timers/promises';
export class CatalogError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code=code; }
}
export function safeProviderUrl(value: string, origin: string) {
  const url=new URL(value,origin);
  if(url.origin!==origin || !url.pathname.startsWith('/v1/'))throw new CatalogError('untrusted_pagination_url');
  return url;
}
export async function fetchJson(url: URL | string, headers: Record<string,string>, method='GET', body?: string): Promise<unknown> {
  for(let attempt=0;attempt<5;attempt++) {
    const response=await fetch(url,{headers,method,body,signal:AbortSignal.timeout(20000)});
    if(response.ok)return response.json();
    await response.body?.cancel();
    if(response.status===429 || response.status>=500) {
      const retry=Number(response.headers.get('retry-after'));
      // A long throttle ends this run visibly; do not hammer the API or hide the coverage gap.
      if(retry>60)throw new CatalogError(`rate_limited_retry_after_${retry}s`);
      if(attempt<4){await delay(Math.max(Number.isFinite(retry)?retry*1000:0,500*2**attempt));continue;}
    }
    throw new CatalogError(`provider_http_${response.status}`);
  }
  throw new CatalogError('provider_retries_exhausted');
}
export function record(value: unknown): Record<string,unknown> {
  if(!value || typeof value!=='object' || Array.isArray(value))throw new CatalogError('invalid_provider_object');
  return value as Record<string,unknown>;
}
export function list(value: unknown): unknown[] {
  if(!Array.isArray(value))throw new CatalogError('invalid_provider_list');return value;
}
export function text(value: unknown) { if(typeof value!=='string'||!value.trim())throw new CatalogError('missing_provider_text');return value; }
export const optionalText=(value: unknown)=>typeof value==='string'&&value.trim()?value:null;
export const positive=(value: unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>0?value:null;
export function providerLink(value: unknown,host:string) {
  if(typeof value!=='string')return null;
  try{const url=new URL(value);return url.protocol==='https:'&&url.hostname===host?value:null;}catch{return null;}
}
export function releaseDate(value: unknown,precision:unknown): {date:string|null;datePrecision:'day'|'month'|'year'|null} {
  if(typeof value!=='string')return {date:null,datePrecision:null};
  const actual=/^\d{4}$/.test(value)?'year':/^\d{4}-\d{2}$/.test(value)?'month':/^\d{4}-\d{2}-\d{2}$/.test(value)?'day':null;
  if(!actual || (precision && precision!==actual))return {date:null,datePrecision:null};
  const date=actual==='year'?`${value}-01-01`:actual==='month'?`${value}-01`:value;
  const parsed=new Date(date);
  return !Number.isNaN(parsed.valueOf())&&parsed.toISOString().slice(0,10)===date?{date,datePrecision:actual}:{date:null,datePrecision:null};
}
