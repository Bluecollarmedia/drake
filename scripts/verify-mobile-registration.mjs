import assert from 'node:assert/strict';
import { connectDatabase } from './lib/database.mjs';
let client;
try {
  client=await connectDatabase();
  const {rows}=await client.query("select i.id,octet_length(i.installation_token_hash) hash_length,u.is_anonymous,p.preferred_music_service,p.onboarding_completed from public.installations i join public.installation_sessions s on s.installation_id=i.id join auth.users u on u.id=s.user_id join public.profiles p on p.id=u.id where i.platform='web' and i.app_version='1.0.0' order by s.last_seen_at desc limit 1");
  assert.equal(rows.length,1,'Open the browser app to register its installation.');
  assert.equal(rows[0].hash_length,32);assert.equal(rows[0].is_anonymous,true);assert(rows[0].onboarding_completed);
  assert(['spotify','apple'].includes(rows[0].preferred_music_service));
  console.log(JSON.stringify({browser_installation_registered:true,server_stores_token_hash_only:true,anonymous_auth_session_associated:true,music_preference_synced:true,installation_id:rows[0].id}));
}catch(error){console.error(`Mobile registration verification failed (${error.code ?? error.message}).`);process.exitCode=1;}
finally{await client?.end();}
