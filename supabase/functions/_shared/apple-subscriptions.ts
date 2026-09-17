import {Buffer} from 'node:buffer';
import {AppStoreServerAPIClient,Environment,SignedDataVerifier} from 'npm:@apple/app-store-server-library@3.1.0';

type ServiceClient={rpc(name:string,args:Record<string,unknown>):Promise<{data:unknown,error:unknown}>};
function required(name:string){const value=Deno.env.get(name);if(!value)throw new Error('apple_configuration_missing');return value;}
function config(){
 const bundleId=required('APPLE_BUNDLE_ID'),appAppleId=Number(required('APPLE_APP_ID'));
 const keyId=required('APPLE_IAP_KEY_ID'),issuerId=required('APPLE_IAP_ISSUER_ID');
 const signingKey=Buffer.from(required('APPLE_IAP_PRIVATE_KEY_BASE64'),'base64').toString('utf8');
 const encodedRoots=JSON.parse(required('APPLE_ROOT_CA_BASE64_JSON'));
 if(!Number.isSafeInteger(appAppleId)||!Array.isArray(encodedRoots)||encodedRoots.length<2)throw new Error('apple_configuration_invalid');
 const roots=encodedRoots.map((value:unknown)=>Buffer.from(String(value),'base64'));
 return {bundleId,appAppleId,keyId,issuerId,signingKey,roots};
}
function tools(environment:Environment,c=config()){
 const production=environment===Environment.PRODUCTION;
 return {verifier:new SignedDataVerifier(c.roots,true,environment,c.bundleId,production?c.appAppleId:undefined),
  api:new AppStoreServerAPIClient(c.signingKey,c.keyId,c.issuerId,c.bundleId,environment)};
}
async function verifySubmittedTransaction(signed:string){
 const c=config();
 for(const environment of [Environment.PRODUCTION,Environment.SANDBOX]){
  try{const configured=tools(environment,c);return {environment,...configured,transaction:await configured.verifier.verifyAndDecodeTransaction(signed)};}catch{}
 }
 throw new Error('apple_transaction_invalid');
}
function statusName(value:number,transaction:any){
 if(transaction.revocationDate)return 'refunded';
 return ({1:'active',2:'expired',3:'billing_retry',4:'grace_period',5:'revoked'} as Record<number,string>)[value]||'pending';
}
function date(value:unknown){const number=Number(value);if(!Number.isFinite(number))throw new Error('apple_period_invalid');return new Date(number).toISOString();}

export async function verifyCurrentSubscription(signedTransactionInfo:string,expectedUserId?:string){
 if(typeof signedTransactionInfo!=='string'||signedTransactionInfo.length<100||signedTransactionInfo.length>20_000)throw new Error('apple_transaction_invalid');
 const submitted=await verifySubmittedTransaction(signedTransactionInfo),submittedTx:any=submitted.transaction;
 if(!submittedTx.transactionId||!submittedTx.originalTransactionId)throw new Error('apple_transaction_invalid');
 if(expectedUserId&&submittedTx.appAccountToken!==expectedUserId)throw new Error('apple_account_mismatch');
 // A device JWS proves a transaction existed. Current access is always taken from Apple's server,
 // preventing replay of an old transaction after expiration, refund, or revocation.
 const status:any=await submitted.api.getAllSubscriptionStatuses(String(submittedTx.transactionId));
 const items=(status.data||[]).flatMap((group:any)=>group.lastTransactions||[]);
 const verified=[] as Array<{item:any;transaction:any;renewal:any}>;
 for(const item of items){
  try{
   const transaction=await submitted.verifier.verifyAndDecodeTransaction(item.signedTransactionInfo);
   const renewal=item.signedRenewalInfo?await submitted.verifier.verifyAndDecodeRenewalInfo(item.signedRenewalInfo):null;
   if(transaction.originalTransactionId===submittedTx.originalTransactionId)verified.push({item,transaction,renewal});
  }catch{}
 }
 verified.sort((a,b)=>Number(b.transaction.expiresDate||0)-Number(a.transaction.expiresDate||0));
 const current=verified[0];if(!current)throw new Error('apple_subscription_not_found');
 if(expectedUserId&&current.transaction.appAccountToken!==expectedUserId)throw new Error('apple_account_mismatch');
 return {
  userId:String(current.transaction.appAccountToken||''),productId:String(current.transaction.productId||''),
  originalTransactionId:String(current.transaction.originalTransactionId||''),latestTransactionId:String(current.transaction.transactionId||''),
  periodStart:date(current.transaction.purchaseDate),periodEnd:date(current.transaction.expiresDate),
  status:statusName(Number(current.item.status),current.transaction),
  environment:String(current.transaction.environment),autoRenew:Number(current.renewal?.autoRenewStatus||0)===1,
  appAccountToken:String(current.transaction.appAccountToken||''),ownershipType:String(current.transaction.inAppOwnershipType||''),
  rawStatus:{appleStatus:Number(current.item.status),verifiedAt:new Date().toISOString()},
 };
}

export async function applyVerifiedSubscription(service:ServiceClient,value:Awaited<ReturnType<typeof verifyCurrentSubscription>>){
 const {data,error}=await service.rpc('apply_apple_subscription',{p_user_id:value.userId,p_product_id:value.productId,
  p_original_transaction_id:value.originalTransactionId,p_latest_transaction_id:value.latestTransactionId,
  p_period_start:value.periodStart,p_period_end:value.periodEnd,p_status:value.status,p_environment:value.environment,
  p_auto_renew:value.autoRenew,p_app_account_token:value.appAccountToken,p_ownership_type:value.ownershipType,p_raw_status:value.rawStatus});
 if(error)throw new Error('subscription_persistence_failed');return data;
}

export async function verifyNotification(signedPayload:string){
 if(typeof signedPayload!=='string'||signedPayload.length<100||signedPayload.length>100_000)throw new Error('apple_notification_invalid');
 const c=config();
 for(const environment of [Environment.PRODUCTION,Environment.SANDBOX]){
  try{return await tools(environment,c).verifier.verifyAndDecodeNotification(signedPayload);}catch{}
 }
 throw new Error('apple_notification_invalid');
}
