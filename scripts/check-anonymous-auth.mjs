import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Public Supabase configuration is missing.');
try {
  const response = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { phase_2_verification: true } }),
  });
  const result = await response.json();
  if (!response.ok) {
    console.error(JSON.stringify({ status: response.status, error_code: result.error_code ?? result.code, message: result.msg ?? result.message }));
    process.exitCode = 1;
  } else if (!result.access_token || !result.user?.is_anonymous) {
    console.error('The server did not return an anonymous session.');
    process.exitCode = 1;
  } else {
    const directory = fileURLToPath(new URL('../.secrets/', import.meta.url));
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('../.secrets/auth-probe.local.json', import.meta.url), JSON.stringify(result), { mode: 0o600 });
    console.log('Anonymous sign-in verified. The test session is stored locally, excluded from Git.');
  }
} catch {
  console.error('Could not connect to Supabase Auth.');
  process.exitCode = 1;
}
