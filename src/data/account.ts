import { getBackendConfig, getSupabase } from './supabase';
export async function deleteAccount(){
 const {data:{session}}=await getSupabase().auth.getSession();if(!session)throw new Error('authentication_required');
 const {url,key}=getBackendConfig();
 const response=await fetch(`${url}/functions/v1/delete-account`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${session.access_token}`},
  body:JSON.stringify({confirm:true,acknowledgeAppleBilling:true})});
 if(!response.ok)throw new Error('account_deletion_failed');
}
