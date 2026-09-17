import { getSupabase } from './supabase';
import { decodeUsage } from '@/domain/usage';
import { installationRepository } from '@/platform/installation';
export async function loadUsageStatus() {
  const identity = await installationRepository.get();
  const { data, error } = await getSupabase().rpc('get_usage_status', { p_id: identity.id, p_token: identity.token });
  if (error) throw error;
  return decodeUsage(data);
}
export async function loadInstallationId(){return (await installationRepository.get()).id;}
