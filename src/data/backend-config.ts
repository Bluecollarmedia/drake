export function validateBackendConfig(url: string | undefined, key: string | undefined) {
  if (!url || !key) throw new Error('Backend configuration is missing.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(parsed.hostname))) {
    throw new Error('Backend URL must use HTTPS.');
  }
  if (key.startsWith('sb_publishable_')) return { url: parsed.origin, key };
  // Legacy anon JWTs are supported; privileged JWTs must never initialize a client.
  try {
    const payload = key.split('.')[1];
    if (payload && JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/'))).role === 'anon') return { url: parsed.origin, key };
  } catch { /* Invalid public configuration is handled below. */ }
  throw new Error('Only a public Supabase publishable or anon key is allowed.');
}
