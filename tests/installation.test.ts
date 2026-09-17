import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import test from 'node:test';
import { createInstallationRepository, INSTALLATION_KEY } from '../src/data/installation.ts';
import { createChunkedStorage, type PrivateStorage } from '../src/data/private-storage.ts';
import { validateBackendConfig } from '../src/data/backend-config.ts';
import { decodeUsage } from '../src/domain/usage.ts';
function memory() {
  const values=new Map<string,string>();
  const storage: PrivateStorage={async getItem(key){return values.get(key) ?? null;},async setItem(key,value){values.set(key,value);},async removeItem(key){values.delete(key);}};
  return {values,storage};
}
const generate=async()=>({version:1 as const,id:randomUUID(),token:randomBytes(32).toString('hex')});
test('installation survives fresh repository/session state and unrelated preference deletion',async()=>{
  const {values,storage}=memory();
  const repository=createInstallationRepository(storage,generate);
  const [first,simultaneous]=await Promise.all([repository.get(),repository.get()]);
  assert.deepEqual(first,simultaneous);
  values.delete('which-drake.auth.v1'); values.delete('which-drake:local-state:v1');
  const reloaded=await createInstallationRepository(storage,generate).get();
  assert.deepEqual(reloaded,first); assert.equal(values.size,1);
});
test('corrupt or inaccessible secure storage never silently creates a fresh allowance identity',async()=>{
  const {values,storage}=memory(); let generated=0;
  const generateCounted=async()=>{generated++;return generate();};
  values.set(INSTALLATION_KEY,'invalid');
  await assert.rejects(createInstallationRepository(storage,generateCounted).get()); assert.equal(generated,0);
  storage.getItem=async()=>{throw new Error('locked');};
  await assert.rejects(createInstallationRepository(storage,generateCounted).get()); assert.equal(generated,0);
});
test('installation is not considered ready if secure persistence fails',async()=>{
  const {storage}=memory();storage.setItem=async()=>{throw new Error('disk');};
  await assert.rejects(createInstallationRepository(storage,generate).get());
});
test('large unicode Auth sessions roundtrip within small Keychain entry sizes',async()=>{
  const {values,storage}=memory();const secure=createChunkedStorage(storage,randomUUID);
  const value='a'.repeat(383)+'🎧'.repeat(1400)+' final';
  await secure.setItem('session',value);
  assert.equal(await secure.getItem('session'),value);
  assert([...values.values()].every(chunk=>Buffer.byteLength(chunk,'utf8') <= 1536));
  await secure.removeItem('session');assert.equal(await secure.getItem('session'),null);assert.equal(values.size,0);
});
test('partial Keychain writes preserve the previously committed Auth session',async()=>{
  const {storage}=memory();const secure=createChunkedStorage(storage,randomUUID);
  await secure.setItem('session','previous');
  const original=storage.setItem; let writes=0;
  storage.setItem=async(key,value)=>{if(++writes===2)throw new Error('keychain');await original(key,value);};
  await assert.rejects(secure.setItem('session','x'.repeat(1000)));
  assert.equal(await secure.getItem('session'),'previous');
});
test('serialized session replacement cannot return an incomplete concurrent read',async()=>{
  const {storage}=memory();const secure=createChunkedStorage(storage,randomUUID);
  await secure.setItem('session','first');
  const [ ,read]=await Promise.all([secure.setItem('session','second'.repeat(1000)),secure.getItem('session')]);
  assert.equal(read,'second'.repeat(1000));
});
test('mobile configuration rejects privileged keys and insecure remote endpoints',()=>{
  assert.throws(()=>validateBackendConfig('https://example.supabase.co','sb_secret_bad'));
  const serviceJWT='header.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
  assert.throws(()=>validateBackendConfig('https://example.supabase.co',serviceJWT));
  assert.throws(()=>validateBackendConfig('http://remote.test','sb_publishable_test'));
  assert.equal(validateBackendConfig('https://example.supabase.co','sb_publishable_test').url,'https://example.supabase.co');
});
test('invalid allowance responses fail closed rather than creating client allowances',()=>{
  assert.throws(()=>decodeUsage({enabled:true,used:-1,allowance:3,requires_account:false,full_access:false}));
  assert.throws(()=>decodeUsage({enabled:true,used:0,allowance:'unlimited',requires_account:false,full_access:false}));
});
test('test access is decoded only from an explicit server boolean',()=>{
  assert.equal(decodeUsage({enabled:true,used:1,allowance:null,requires_account:false,full_access:false,test_access:true}).testAccess,true);
  assert.throws(()=>decodeUsage({enabled:true,used:1,allowance:null,requires_account:false,full_access:false,test_access:'yes'}));
});
