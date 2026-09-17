import * as Crypto from 'expo-crypto';
import { getBackendConfig, getSupabase } from './supabase';
import { installationRepository } from '@/platform/installation';
import type { NoStrongMatch, Recommendation, RecommendationOutcome } from '@/domain/recommendation';

export type RecommendationErrorCode = 'too_short'|'too_long'|'authentication'|'network'|'timeout'|'disabled'|'free_limit'|'monthly_limit'|'annual_limit'|'rate_limit'|'busy'|'unavailable'|'malformed';
export class RecommendationError extends Error {
  constructor(public code: RecommendationErrorCode,public resetAt:string|null=null) { super(code); }
}

const isString=(value:unknown):value is string=>typeof value==='string'&&value.length>0;
export function decodeRecommendation(value:unknown):RecommendationOutcome {
  if(!value||typeof value!=='object')throw new RecommendationError('malformed');
  const row=value as Record<string,unknown>;
  if(row.outcome==='no_strong_match'){
    if(!isString(row.requestId)||!isString(row.message)||!isString(row.guidance)||!isString(row.explanation))throw new RecommendationError('malformed');
    return {outcome:'no_strong_match',requestId:row.requestId,message:row.message,guidance:row.guidance,explanation:row.explanation} as NoStrongMatch;
  }
  const song=row.song as Record<string,unknown>|undefined;
  if(!isString(row.requestId)||!song||!isString(song.id)||!isString(song.title)||!Array.isArray(song.artists)
    ||!song.artists.every(isString)||!isString(row.explanation)||typeof row.confidence!=='number')throw new RecommendationError('malformed');
  const release=song.release&&typeof song.release==='object'?song.release as Record<string,unknown>:null;
  const links=song.links&&typeof song.links==='object'?song.links as Record<string,unknown>:{};
  const safeLinks:Recommendation['links']={};
  if(isString(links.spotify))safeLinks.spotify=links.spotify;
  if(isString(links.apple))safeLinks.apple=links.apple;
  return {outcome:'match',requestId:row.requestId,id:song.id,title:song.title,artist:song.artists.join(', ')||'Drake',
    artists:song.artists,version:isString(song.version)?song.version:'original',
    releaseTitle:release&&isString(release.title)?release.title:null,
    releaseDate:release&&isString(release.release_date)?release.release_date:null,
    artworkUrl:isString(song.artworkUrl)?song.artworkUrl:null,explanation:row.explanation,
    confidence:row.confidence,links:safeLinks};
}

function mapError(code:string,status:number):RecommendationErrorCode{
  if(code==='situation_too_short')return 'too_short'; if(code==='situation_too_long')return 'too_long';
  if(code==='authentication_required'||status===401)return 'authentication';
  if(code==='recommendations_disabled')return 'disabled'; if(code==='free_recommendation_limit'||code==='recommendation_allowance_exhausted')return 'free_limit';
  if(code==='monthly_recommendation_limit')return 'monthly_limit';if(code==='annual_recommendation_limit')return 'annual_limit';
  if(code==='minute_rate_limit'||code==='daily_rate_limit'||code==='recommendation_rate_limited'||status===429)return 'rate_limit';
  if(code==='request_already_processing_or_expired'||status===409)return 'busy';
  if(status>=500)return 'unavailable'; return 'malformed';
}

export function newRecommendationRequestId(){return Crypto.randomUUID();}
export async function requestRecommendation(situation:string,requestId:string,timeoutMs=60000){
  const trimmed=situation.replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
  if(trimmed.length<8)throw new RecommendationError('too_short');
  if(trimmed.length>1500)throw new RecommendationError('too_long');
  const [{data:{session}},identity]=await Promise.all([getSupabase().auth.getSession(),installationRepository.get()]);
  if(!session)throw new RecommendationError('authentication');
  const {url,key}=getBackendConfig(); const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(`${url}/functions/v1/recommend`,{method:'POST',signal:controller.signal,headers:{
      'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${session.access_token}`,
    },body:JSON.stringify({requestId,installationId:identity.id,installationToken:identity.token,situation:trimmed})});
    const payload=await response.json().catch(()=>null);
    if(!response.ok){const code=payload&&typeof payload==='object'&&'error' in payload?String(payload.error):'';
      const usage=payload&&typeof payload==='object'&&'usage' in payload&&payload.usage&&typeof payload.usage==='object'?payload.usage as Record<string,unknown>:null;
      throw new RecommendationError(mapError(code,response.status),usage&&isString(usage.reset_at)?usage.reset_at:null);}
    return decodeRecommendation(payload);
  }catch(error){
    if(error instanceof RecommendationError)throw error;
    if(error instanceof Error&&error.name==='AbortError')throw new RecommendationError('timeout');
    throw new RecommendationError('network');
  }finally{clearTimeout(timer);}
}

function dateLabel(value:string|null){if(!value)return null;const date=new Date(value);return Number.isNaN(date.valueOf())?null:date.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});}
export function recommendationErrorMessage(error:RecommendationError){
  const reset=dateLabel(error.resetAt);
  const code=error.code;
  return ({too_short:'Add a little more detail so we can find the right fit.',too_long:'That’s a lot to hold. Please shorten it to about a few paragraphs.',
    authentication:'We couldn’t start your private session. Please try again.',network:'We couldn’t reach Which Drake?. Check your connection and try again.',
    timeout:'This is taking longer than expected. You can safely try again.',disabled:'Recommendations are taking a quick pause. Please try again later.',
    free_limit:'You’ve used your 3 free recommendations. Full Access is required to keep going.',
    monthly_limit:`You’ve reached this month’s recommendation limit.${reset?` Your recommendations reset on ${reset}.`:''}`,
    annual_limit:`You’ve reached this year’s recommendation limit.${reset?` Your recommendations reset on ${reset}.`:''}`,
    rate_limit:'You’re moving fast. Please try again later.',
    busy:'That recommendation is still being prepared. Please try again in a moment.',unavailable:'The recommendation service is temporarily unavailable. Please try again.',
    malformed:'We received an incomplete result. Please try again.'})[code];
}
