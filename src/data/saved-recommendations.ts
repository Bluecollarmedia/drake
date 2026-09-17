import { getSupabase } from './supabase';
import type { Recommendation } from '@/domain/recommendation';
import type { MusicService } from '@/domain/music';
interface SaveRecommendation { songId: string; explanation: string }
export async function saveRecommendation({ songId, explanation }: SaveRecommendation) {
  const client = getSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!user || user.is_anonymous !== false) throw new Error('An account is required to save.');
  // Raw user input is deliberately absent from this API. Catalog UUIDs only; no UI fixture IDs.
  if (!/^[a-f0-9-]{36}$/i.test(songId)) throw new Error('This song is not in the canonical catalog.');
  const { data, error } = await client.from('saved_recommendations').insert({
    user_id: user.id, song_id: songId, recommendation_explanation: explanation,
    retain_original_input: false, original_user_input: null,
  }).select('id,song_id,recommendation_explanation,created_at').single();
  if (error) throw error;
  return data;
}
export async function listSavedRecommendations() {
  // RLS scopes the results even if a malicious client omits a user filter.
  const { data, error } = await getSupabase().from('saved_recommendations').select(`id,song_id,recommendation_explanation,created_at,
    songs(title,version_key,song_artists(role,credit_order,artists(name)),song_provider_ids(provider,url),release_tracks(track_number,releases(title,release_date,artwork)))`).order('created_at', { ascending: false });
  if (error) throw error;
  return (data??[]).map(decodeSaved).filter((value):value is SavedRecommendation=>!!value);
}

export async function findSavedRecommendation(songId:string){
  const {data,error}=await getSupabase().from('saved_recommendations').select('id').eq('song_id',songId).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;return data;
}
export async function deleteSavedRecommendation(id:string){const {error}=await getSupabase().from('saved_recommendations').delete().eq('id',id);if(error)throw error;}

export interface SavedRecommendation {id:string;createdAt:string;recommendation:Recommendation}
function decodeSaved(row:any):SavedRecommendation|null{
 const song=Array.isArray(row.songs)?row.songs[0]:row.songs;if(!song||typeof song.title!=='string')return null;
 const credits=(song.song_artists??[]).slice().sort((a:any,b:any)=>a.credit_order-b.credit_order).map((item:any)=>item.artists?.name).filter((name:any)=>typeof name==='string');
 const appearances=(song.release_tracks??[]).slice().sort((a:any,b:any)=>a.track_number-b.track_number);const release=Array.isArray(appearances[0]?.releases)?appearances[0].releases[0]:appearances[0]?.releases;
 const artwork=Array.isArray(release?.artwork)?release.artwork.find((item:any)=>typeof item?.url==='string'&&item.url.startsWith('https://'))?.url:null;
 const links=Object.fromEntries((song.song_provider_ids??[]).filter((item:any)=>['spotify','apple'].includes(item.provider)&&typeof item.url==='string').map((item:any)=>[item.provider,item.url])) as Partial<Record<MusicService,string>>;
 return {id:row.id,createdAt:row.created_at,recommendation:{outcome:'match',requestId:`saved-${row.id}`,id:row.song_id,title:song.title,artist:credits.join(', ')||'Drake',artists:credits,version:song.version_key||'original',releaseTitle:release?.title??null,releaseDate:release?.release_date??null,artworkUrl:artwork,explanation:row.recommendation_explanation,confidence:1,links}};
}
