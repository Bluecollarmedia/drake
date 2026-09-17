import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {applyVerifiedSubscription,verifyCurrentSubscription} from '../_shared/apple-subscriptions.ts';

const allowedOrigins=new Set((Deno.env.get('ALLOWED_WEB_ORIGINS')||'http://localhost:8081,http://127.0.0.1:8081').split(',').map(value=>value.trim()).filter(Boolean));
Deno.serve(async request=>{
 const origin=request.headers.get('Origin'),cors={'Access-Control-Allow-Origin':origin&&allowedOrigins.has(origin)?origin:'','Vary':'Origin',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(origin&&!allowedOrigins.has(origin))return json({error:'origin_not_allowed'},403);
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 const authorization=request.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return json({error:'authentication_required'},401);
 const url=Deno.env.get('SUPABASE_URL'),publicKey=Deno.env.get('SUPABASE_ANON_KEY'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!publicKey||!serviceKey)return json({error:'service_unavailable'},503);
 const userClient=createClient(url,publicKey,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await userClient.auth.getUser();if(error||!user||user.is_anonymous)return json({error:'account_required'},401);
 let body:Record<string,unknown>;try{body=await request.json();}catch{return json({error:'invalid_json'},400);}
 try{
  const verified=await verifyCurrentSubscription(String(body.signedTransactionInfo||''),user.id);
  await applyVerifiedSubscription(service,verified);
  const status=await userClient.rpc('get_usage_status',{p_id:String(body.installationId||''),p_token:String(body.installationToken||'')});
  return json({verified:true,usage:status.data});
 }catch(problem){
  const code=String((problem as Error)?.message||'');
  if(code.includes('configuration'))return json({error:'purchases_not_configured'},503);
  if(code.includes('account'))return json({error:'purchase_account_mismatch'},403);
  return json({error:'purchase_verification_failed'},400);
 }
});
