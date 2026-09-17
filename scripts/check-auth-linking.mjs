import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
const session = JSON.parse(await readFile(new URL('../.secrets/auth-probe.local.json', import.meta.url), 'utf8'));
const client = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'pkce' },
});
const { error: sessionError } = await client.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (sessionError) {
  console.error(JSON.stringify({ error_code: sessionError.code, message: 'Test session could not be restored.' }));
  process.exitCode = 1;
} else {
  // Requests the linking endpoint only; does not open OAuth or invent provider credentials.
  const { error } = await client.auth.linkIdentity({ provider: 'google', options: { skipBrowserRedirect: true } });
  console.log(JSON.stringify({ linking_endpoint_accepted: !error, error_code: error?.code, message: error?.message }));
  if (error) process.exitCode = 1;
}
