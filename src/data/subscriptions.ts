import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { getBackendConfig, getSupabase } from './supabase';
import { subscriptionPlans, type SubscriptionProductId } from '@/domain/subscription';
import { installationRepository } from '@/platform/installation';

export interface StoreProduct { productId: SubscriptionProductId; displayPrice: string }
const ids=new Set<string>(subscriptionPlans.map(plan=>plan.productId));

export function nativePurchasesConfigured(){
 return Platform.OS==='ios'&&Constants.executionEnvironment!==ExecutionEnvironment.StoreClient&&process.env.EXPO_PUBLIC_APPLE_PURCHASES_ENABLED==='true';
}
function ensureAvailable(){if(!nativePurchasesConfigured())throw new Error(Constants.executionEnvironment===ExecutionEnvironment.StoreClient?'development_build_required':'purchases_not_configured');}
async function store(){ensureAvailable();return import('expo-iap');}
async function verifyOnServer(signedTransactionInfo:string){
 const [{data:{session}},identity]=await Promise.all([getSupabase().auth.getSession(),installationRepository.get()]);
 if(!session||session.user.is_anonymous)throw new Error('account_required');
 const {url,key}=getBackendConfig();
 const response=await fetch(`${url}/functions/v1/apple-subscriptions`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({signedTransactionInfo,installationId:identity.id,installationToken:identity.token})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok||payload?.verified!==true)throw new Error(String(payload?.error||'purchase_verification_failed'));
 return payload;
}
export async function loadSubscriptionProducts():Promise<StoreProduct[]>{
 const iap=await store();await iap.initConnection();
 try{const products=await iap.fetchProducts({skus:[...ids],type:'subs'});return (products||[]).filter(item=>ids.has(item.id)).map(item=>({productId:item.id as SubscriptionProductId,displayPrice:item.displayPrice}));}
 finally{await iap.endConnection().catch(()=>{});}
}
export async function purchaseSubscription(productId:SubscriptionProductId){
 if(!ids.has(productId))throw new Error('unknown_product');const iap=await store();await iap.initConnection();
 let update:{remove():void}|undefined,errorListener:{remove():void}|undefined,timer:ReturnType<typeof setTimeout>|undefined;
 try{
  const products=await iap.fetchProducts({skus:[productId],type:'subs'});if(!products?.some(product=>product.id===productId))throw new Error('product_unavailable');
  const {data:{session}}=await getSupabase().auth.getSession();if(!session||session.user.is_anonymous)throw new Error('account_required');
  return await new Promise<void>((resolve,reject)=>{
   const settle=(action:()=>void)=>{if(timer)clearTimeout(timer);update?.remove();errorListener?.remove();action();};
   update=iap.purchaseUpdatedListener(purchase=>{void (async()=>{if(purchase.productId!==productId)return;const token=purchase.purchaseToken;if(!token)throw new Error('purchase_token_missing');await verifyOnServer(token);await iap.finishTransaction({purchase,isConsumable:false});settle(resolve);})().catch(problem=>settle(()=>reject(problem)));});
   errorListener=iap.purchaseErrorListener(problem=>settle(()=>reject(new Error(problem.code==='user-cancelled'?'purchase_cancelled':'purchase_failed'))));
   timer=setTimeout(()=>settle(()=>reject(new Error('purchase_timeout'))),120_000);
   void iap.requestPurchase({request:{apple:{sku:productId,appAccountToken:session.user.id}},type:'subs'}).catch(problem=>settle(()=>reject(problem)));
  });
 }finally{if(timer)clearTimeout(timer);update?.remove();errorListener?.remove();await iap.endConnection().catch(()=>{});}
}
export async function restoreSubscriptions(){
 const iap=await store();await iap.initConnection();
 try{const purchases=await iap.getAvailablePurchases({onlyIncludeActiveItemsIOS:true});let restored=0;for(const purchase of purchases){if(!ids.has(purchase.productId)||!purchase.purchaseToken)continue;await verifyOnServer(purchase.purchaseToken);await iap.finishTransaction({purchase,isConsumable:false});restored++;}return restored;}
 finally{await iap.endConnection().catch(()=>{});}
}
