export interface UsageStatus {
  enabled:boolean;used:number;allowance:number|null;remaining:number|null;requiresAccount:boolean;requiresFullAccess:boolean;
  fullAccess:boolean;testAccess:boolean;plan:'free'|'monthly'|'annual'|'test';resetAt:string|null;subscriptionStatus:string|null;autoRenews:boolean|null;
}
export function decodeUsage(value: unknown): UsageStatus {
  if (!value || typeof value !== 'object') throw new Error('Invalid usage status.');
  const row = value as Record<string, unknown>;
  if (typeof row.enabled !== 'boolean' || typeof row.used !== 'number' || !Number.isSafeInteger(row.used) || row.used < 0
    || (row.allowance !== null && (typeof row.allowance !== 'number' || !Number.isSafeInteger(row.allowance) || row.allowance < 0))
    || (row.remaining!==null&&row.remaining!==undefined&&(typeof row.remaining!=='number'||!Number.isSafeInteger(row.remaining)||row.remaining<0))
    || typeof row.requires_account !== 'boolean' || typeof row.full_access !== 'boolean'
    || (row.test_access!==undefined&&typeof row.test_access!=='boolean')) throw new Error('Invalid usage status.');
  const plan=['free','monthly','annual','test'].includes(String(row.plan))?row.plan as UsageStatus['plan']:'free';
  return {enabled:row.enabled,used:row.used,allowance:row.allowance as number|null,remaining:typeof row.remaining==='number'?row.remaining:null,
    requiresAccount:row.requires_account,requiresFullAccess:row.requires_full_access===true,fullAccess:row.full_access,testAccess:row.test_access===true,plan,
    resetAt:typeof row.reset_at==='string'?row.reset_at:null,subscriptionStatus:typeof row.subscription_status==='string'?row.subscription_status:null,
    autoRenews:typeof row.auto_renews==='boolean'?row.auto_renews:null};
}
