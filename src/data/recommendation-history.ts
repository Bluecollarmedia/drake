import type { Recommendation } from '@/domain/recommendation';
import { decodeRecommendation } from './recommendations';
import { getSupabase } from './supabase';

interface HistoryRow {
  id: string;
  situation_text: string;
  result_payload: unknown;
  created_at: string;
}

export interface RecommendationHistoryItem {
  id: string;
  situation: string;
  createdAt: string;
  recommendation: Recommendation;
}

export function decodeHistoryRow(row: HistoryRow): RecommendationHistoryItem {
  const recommendation = decodeRecommendation(row.result_payload);
  if (recommendation.outcome !== 'match') throw new Error('History contains a non-match result.');
  return { id: row.id, situation: row.situation_text, createdAt: row.created_at, recommendation };
}

export async function listRecommendationHistory() {
  const { data, error } = await getSupabase().from('recommendation_history')
    .select('id,situation_text,result_payload,created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as HistoryRow[]).map(decodeHistoryRow);
}

export async function deleteRecommendationHistoryItem(id: string) {
  const { error } = await getSupabase().from('recommendation_history').delete().eq('id', id);
  if (error) throw error;
}

export async function clearRecommendationHistory() {
  const { error } = await getSupabase().from('recommendation_history').delete().not('id', 'is', null);
  if (error) throw error;
}
