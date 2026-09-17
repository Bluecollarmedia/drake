import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {applyVerifiedSubscription,verifyCurrentSubscription,verifyNotification} from '../_shared/apple-subscriptions.ts';

Deno.serve(async request=>{
 if(request.method!=='POST')return new Response(null,{status:405});
 const url=Deno.env.get('SUPABASE_URL'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!serviceKey)return new Response(null,{status:503});
 let signedPayload='';try{signedPayload=String((await request.json()).signedPayload||'');}catch{return new Response(null,{status:400});}
 try{
  const notification:any=await verifyNotification(signedPayload);
  const signedTransaction=notification?.data?.signedTransactionInfo;if(!signedTransaction)return new Response(null,{status:200});
  const verified=await verifyCurrentSubscription(signedTransaction);
  if(!verified.userId)return new Response(null,{status:200});
  const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  await applyVerifiedSubscription(service,verified);
  return new Response(null,{status:200});
 }catch{return new Response(null,{status:400});}
});
