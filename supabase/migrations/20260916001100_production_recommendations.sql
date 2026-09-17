-- Phase 5: tightly scoped owner/development access. The kill switch remains authoritative.
create table public.recommendation_test_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  installation_id uuid references public.installations(id) on delete cascade,
  label text not null check(length(label) between 1 and 120),
  active boolean not null default true,
  expires_at timestamptz,
  rate_limit_per_minute integer not null default 30 check(rate_limit_per_minute between 1 and 60),
  rate_limit_per_day integer not null default 500 check(rate_limit_per_day between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(num_nonnulls(user_id,installation_id)=1)
);
create unique index recommendation_test_access_user on public.recommendation_test_access(user_id) where user_id is not null;
create unique index recommendation_test_access_installation on public.recommendation_test_access(installation_id) where installation_id is not null;
alter table public.recommendation_test_access enable row level security;
revoke all on public.recommendation_test_access from public,anon,authenticated;
grant all on public.recommendation_test_access to service_role;
create trigger recommendation_test_access_updated before update on public.recommendation_test_access
  for each row execute function public.touch_updated_at();
comment on table public.recommendation_test_access is 'Service-managed, expiring test allowlist. Clients cannot read or grant access. It bypasses allowance only; the global kill switch and explicit rate limits still apply.';

create or replace function public.get_usage_status(p_id uuid, p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid:=auth.uid();v_anonymous boolean;v_count bigint;v_policy public.usage_policies;
  v_full boolean;v_test boolean;
begin
  if v_user is null or not exists(select 1 from public.installation_sessions s join public.installations i on i.id=s.installation_id
    where s.installation_id=p_id and s.user_id=v_user and i.installation_token_hash=extensions.digest(p_token,'sha256'))
    then raise exception 'Invalid installation session' using errcode='42501'; end if;
  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select * into v_policy from public.usage_policies where id='default';
  select count(*) into v_count from public.usage_events where event_type='recommendation'
    and status in ('reserved','completed') and (installation_id=p_id or (v_anonymous is false and user_id=v_user));
  select exists(select 1 from public.entitlements where user_id=v_user and status='active' and verified_at is not null) into v_full;
  select exists(select 1 from public.recommendation_test_access a where a.active
    and (a.expires_at is null or a.expires_at>now()) and (a.user_id=v_user or a.installation_id=p_id)) into v_test;
  return jsonb_build_object('enabled',v_policy.recommendations_enabled,'used',v_count,
    'allowance',case when v_full or v_test then null when v_anonymous then v_policy.anonymous_allowance else v_policy.account_allowance end,
    'requires_account',not v_test and v_anonymous and v_count>=v_policy.anonymous_allowance,
    'full_access',v_full,'test_access',v_test);
end $$;

create or replace function public.reserve_recommendation(
  p_request_id uuid,p_installation_id uuid,p_installation_token text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_user uuid:=auth.uid();v_anonymous boolean;v_policy public.usage_policies;v_count bigint;v_full boolean;
  v_test boolean:=false;v_minute_limit integer;v_day_limit integer;v_existing public.usage_events;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_installation_token is null or p_installation_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid installation session' using errcode='42501'; end if;
  perform 1 from public.installations i join public.installation_sessions s on s.installation_id=i.id
    where i.id=p_installation_id and s.user_id=v_user
      and i.installation_token_hash=extensions.digest(p_installation_token,'sha256') for update of i;
  if not found then raise exception 'Invalid installation session' using errcode='42501'; end if;
  select * into v_existing from public.usage_events where installation_id=p_installation_id
    and request_id=p_request_id and event_type='recommendation';
  if found then return jsonb_build_object('reserved',v_existing.status in ('reserved','completed'),'existing',true,'status',v_existing.status); end if;
  select * into v_policy from public.usage_policies where id='default';
  if not v_policy.recommendations_enabled then raise exception 'Recommendations are disabled' using errcode='P0001'; end if;
  select true,a.rate_limit_per_minute,a.rate_limit_per_day into v_test,v_minute_limit,v_day_limit
    from public.recommendation_test_access a where a.active and (a.expires_at is null or a.expires_at>now())
      and (a.user_id=v_user or a.installation_id=p_installation_id)
    order by (a.installation_id is not null) desc limit 1;
  v_minute_limit:=coalesce(v_minute_limit,v_policy.recommendation_rate_limit_per_minute);
  v_day_limit:=coalesce(v_day_limit,v_policy.recommendation_rate_limit_per_day);
  if (select count(*) from public.usage_events where installation_id=p_installation_id and event_type='recommendation'
      and status in ('reserved','completed') and created_at>now()-interval '1 minute') >= v_minute_limit
    then raise exception 'Recommendation rate limit exceeded' using errcode='P0001'; end if;
  if (select count(*) from public.usage_events where installation_id=p_installation_id and event_type='recommendation'
      and status in ('reserved','completed') and created_at>now()-interval '1 day') >= v_day_limit
    then raise exception 'Recommendation daily rate limit exceeded' using errcode='P0001'; end if;
  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select exists(select 1 from public.entitlements where user_id=v_user and status='active' and verified_at is not null) into v_full;
  select count(*) into v_count from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
    and (installation_id=p_installation_id or (v_anonymous is false and user_id=v_user));
  if not v_full and not v_test and v_count >= (case when v_anonymous then v_policy.anonymous_allowance else v_policy.account_allowance end)
    then raise exception 'Recommendation allowance exhausted' using errcode='P0001'; end if;
  insert into public.usage_events(user_id,installation_id,event_type,request_id,status,metadata)
    values(v_user,p_installation_id,'recommendation',p_request_id,'reserved',jsonb_build_object('phase','recommendation_v1','test_access',v_test));
  return jsonb_build_object('reserved',true,'existing',false,'status','reserved','test_access',v_test);
end $$;

revoke execute on function public.get_usage_status(uuid,text),public.reserve_recommendation(uuid,uuid,text) from public,anon;
grant execute on function public.get_usage_status(uuid,text),public.reserve_recommendation(uuid,uuid,text) to authenticated,service_role;
