import 'react-native-url-polyfill/auto';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { validateBackendConfig } from './backend-config';
import { sessionStorage } from '@/platform/private-storage';
let client: SupabaseClient | undefined;
export function getBackendConfig() {
  return validateBackendConfig(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
export function getSupabase() {
  if (!client) {
    const { url, key } = getBackendConfig();
    client = createClient(url, key, { auth: {
      storage: sessionStorage, storageKey: 'which-drake.auth.v1', persistSession: true,
      autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce', lock: processLock,
    } });
  }
  return client;
}
