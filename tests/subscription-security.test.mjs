import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('Full Access defines only monthly and annual products with exact allowances',async()=>{
 const [domain,sql]=await Promise.all([
  readFile(new URL('../src/domain/subscription.ts',import.meta.url),'utf8'),
  readFile(new URL('../supabase/migrations/20260916001200_prelaunch_hardening.sql',import.meta.url),'utf8'),
 ]);
 assert.match(domain,/\$1\.99\/month/);assert.match(domain,/50 recommendations per month/);
 assert.match(domain,/\$9\.99\/year/);assert.match(domain,/300 recommendations per year/);
 assert.doesNotMatch(domain,/lifetime/i);assert.match(sql,/\('com\.whichdrake\.app\.fullaccess\.monthly','monthly','month',50,1\.99/);assert.match(sql,/annual','annual','year',300,9\.99/);
});

test('native purchase flow binds the Apple transaction to the account and finishes only after server verification',async()=>{
 const source=await readFile(new URL('../src/data/subscriptions.ts',import.meta.url),'utf8');
 assert.match(source,/appAccountToken:session\.user\.id/);
 assert.match(source,/await verifyOnServer\(token\);await iap\.finishTransaction/);
 assert.match(source,/ExecutionEnvironment\.StoreClient/);
 assert.doesNotMatch(source,/service_role|OPENAI_API_KEY|APPLE_IAP_PRIVATE_KEY/);
});

test('server subscription sync checks current Apple status and applies it through a service-only RPC',async()=>{
 const [shared,endpoint]=await Promise.all([
  readFile(new URL('../supabase/functions/_shared/apple-subscriptions.ts',import.meta.url),'utf8'),
  readFile(new URL('../supabase/functions/apple-subscriptions/index.ts',import.meta.url),'utf8'),
 ]);
 assert.match(shared,/getAllSubscriptionStatuses/);assert.match(shared,/appAccountToken!==expectedUserId/);
 assert.match(shared,/apply_apple_subscription/);assert.match(endpoint,/user\.is_anonymous/);
});
