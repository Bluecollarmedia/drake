// Server-only module. Never import anything under scripts/ from the mobile app.
import { readFile } from 'node:fs/promises';
import pg from 'pg';

export async function connectDatabase() {
  const local = JSON.parse((await readFile(new URL('../../.secrets/supabase.local.json', import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
  const pooler = new URL((await readFile(new URL('../../supabase/.temp/pooler-url', import.meta.url), 'utf8')).trim());
  const ca = await readFile(new URL('../../supabase/certs/supabase-ca.crt', import.meta.url), 'utf8');
  const client = new pg.Client({
    host: pooler.hostname, port: Number(pooler.port || 5432), user: decodeURIComponent(pooler.username),
    database: pooler.pathname.slice(1), password: local.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: true, ca }, connectionTimeoutMillis: 15000,
    application_name: 'which-drake-phase2-admin',
  });
  await client.connect();
  return client;
}
