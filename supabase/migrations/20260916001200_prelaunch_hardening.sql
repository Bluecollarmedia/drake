-- Pre-launch monetization, usage, and operator-cost controls.
-- Prices are presentation metadata only. Apple-signed transactions remain authoritative.

alter table public.usage_policies
  alter column account_allowance set default 3,
  alter column recommendation_rate_limit_per_day set default 20;
update public.usage_policies set
  anonymous_allowance=3,
  account_allowance=3,
  recommendation_rate_limit_per_minute=5,
  recommendation_rate_limit_per_day=20
where id='default';

alter table public.usage_policies
  add column global_budgets_enabled boolean not null default true,
  add column global_daily_budget_usd numeric(12,4) not null default 5 check(global_daily_budget_usd > 0),
  add column global_monthly_budget_usd numeric(12,4) not null default 50 check(global_monthly_budget_usd > 0),
  add column global_warning_ratio numeric(5,4) not null default .8 check(global_warning_ratio > 0 and global_warning_ratio < 1),
  add column recommendation_cost_reservation_usd numeric(12,6) not null default .10 check(recommendation_cost_reservation_usd > 0),
  add column reservation_ttl_minutes integer not null default 10 check(reservation_ttl_minutes between 5 and 60);

create table public.subscription_products (
  product_id text primary key,
  plan_code text not null unique check(plan_code in ('monthly','annual')),
  display_name text not null default 'Full Access',
  billing_period text not null check(billing_period in ('month','year')),
  recommendation_allowance integer not null check(recommendation_allowance > 0),
  intended_price_usd numeric(8,2) not null check(intended_price_usd > 0),
  active boolean not null default true,
  configuration_status text not null default 'owner_confirmation_required'
    check(configuration_status in ('owner_confirmation_required','configured','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.subscription_products(product_id,plan_code,billing_period,recommendation_allowance,intended_price_usd)
values
  ('com.whichdrake.app.fullaccess.monthly','monthly','month',50,1.99),
  ('com.whichdrake.app.fullaccess.annual','annual','year',300,9.99)
on conflict(product_id) do update set
  plan_code=excluded.plan_code,billing_period=excluded.billing_period,
  recommendation_allowance=excluded.recommendation_allowance,intended_price_usd=excluded.intended_price_usd;
create trigger subscription_products_updated before update on public.subscription_products
  for each row execute function public.touch_updated_at();

-- Expand the entitlement record so an Apple-verified billing period, not a client claim,
-- determines access and its allowance window.
do $$ declare v_name text; begin
  select conname into v_name from pg_constraint
    where conrelid='public.entitlements'::regclass and contype='c'
      and pg_get_constraintdef(oid) ilike '%status%active%expired%revoked%pending%';
  if v_name is not null then execute format('alter table public.entitlements drop constraint %I',v_name); end if;
end $$;
alter table public.entitlements
  add column plan_code text references public.subscription_products(plan_code),
  add column current_period_start timestamptz,
  add column current_period_end timestamptz,
  add column environment text check(environment in ('Sandbox','Production')),
  add column auto_renew_status boolean,
  add column app_account_token uuid,
  add column latest_transaction_id text,
  add column ownership_type text,
  add column revoked_at timestamptz,
  add column raw_status jsonb not null default '{}'::jsonb check(jsonb_typeof(raw_status)='object'),
  add constraint entitlements_status_check check(status in
    ('active','grace_period','billing_retry','expired','revoked','refunded','pending')),
  add constraint entitlement_period_check check(
    (current_period_start is null and current_period_end is null) or
    (current_period_start is not null and current_period_end > current_period_start)
  );
create unique index entitlements_latest_transaction on public.entitlements(latest_transaction_id)
  where latest_transaction_id is not null;
create index entitlements_active_period on public.entitlements(user_id,current_period_end)
  where status in ('active','grace_period');

create table public.operator_budget_periods (
  period_kind text not null check(period_kind in ('day','month')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  reserved_cost_usd numeric(14,8) not null default 0 check(reserved_cost_usd >= 0),
  committed_cost_usd numeric(14,8) not null default 0 check(committed_cost_usd >= 0),
  completed_requests integer not null default 0 check(completed_requests >= 0),
  warning_recorded_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(period_kind,period_start),
  check(period_end > period_start)
);

alter table public.usage_events
  add column allowance_bucket text check(allowance_bucket in ('free','monthly','annual','test')),
  add column entitlement_id uuid references public.entitlements(id) on delete set null,
  add column allowance_period_start timestamptz,
  add column allowance_period_end timestamptz,
  add column reserved_cost_usd numeric(12,8) not null default 0 check(reserved_cost_usd >= 0),
  add column actual_cost_usd numeric(12,8) check(actual_cost_usd is null or actual_cost_usd >= 0),
  add column reservation_expires_at timestamptz,
  add column budget_day_start timestamptz,
  add column budget_month_start timestamptz;
create index usage_events_active_reservations on public.usage_events(reservation_expires_at)
  where status='reserved';
create index usage_events_allowance on public.usage_events(user_id,allowance_bucket,allowance_period_start,created_at)
  where event_type='recommendation' and status in ('reserved','completed');
create unique index usage_events_user_request on public.usage_events(user_id,request_id,event_type)
  where user_id is not null;

alter table public.recommendation_runs
  add column outcome text check(outcome in ('match','no_strong_match'));

create table public.operator_alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null check(alert_type in ('daily_warning','monthly_warning','daily_ceiling','monthly_ceiling')),
  period_start timestamptz not null,
  observed_cost_usd numeric(14,8) not null,
  ceiling_usd numeric(14,8) not null,
  created_at timestamptz not null default now(),
  unique(alert_type,period_start)
);

do $$ declare t text; begin
  foreach t in array array['subscription_products','operator_budget_periods','operator_alert_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

-- Clients get a carefully limited plan/status view without access to transaction details.
create or replace function public.get_usage_status(p_id uuid,p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  v_user uuid:=auth.uid();v_anonymous boolean;v_policy public.usage_policies;v_test boolean;
  v_entitlement public.entitlements;v_plan public.subscription_products;v_used bigint:=0;
  v_free_used bigint:=0;v_allowance integer;v_bucket text;v_reset timestamptz;
begin
  if v_user is null or not exists(select 1 from public.installation_sessions s join public.installations i on i.id=s.installation_id
    where s.installation_id=p_id and s.user_id=v_user and i.installation_token_hash=extensions.digest(p_token,'sha256'))
    then raise exception 'Invalid installation session' using errcode='42501'; end if;
  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select * into v_policy from public.usage_policies where id='default';
  select exists(select 1 from public.recommendation_test_access a where a.active
    and (a.expires_at is null or a.expires_at>now()) and (a.user_id=v_user or a.installation_id=p_id)) into v_test;
  select e.* into v_entitlement from public.entitlements e join public.subscription_products p on p.product_id=e.product_id
    where e.user_id=v_user and e.status in ('active','grace_period') and e.verified_at is not null
      and e.current_period_start<=now() and e.current_period_end>now() and p.active
    order by e.current_period_end desc limit 1;
  if found then
    select * into v_plan from public.subscription_products where product_id=v_entitlement.product_id;
    v_bucket:=v_plan.plan_code;v_allowance:=v_plan.recommendation_allowance;v_reset:=v_entitlement.current_period_end;
    select count(*) into v_used from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and user_id=v_user and entitlement_id=v_entitlement.id and created_at>=v_entitlement.current_period_start and created_at<v_entitlement.current_period_end;
  else
    v_bucket:='free';v_allowance:=v_policy.anonymous_allowance;
    select count(*) into v_used from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and allowance_bucket='free' and (installation_id=p_id or (v_anonymous is false and user_id=v_user));
  end if;
  v_free_used:=case when v_bucket='free' then v_used else 0 end;
  return jsonb_build_object(
    'enabled',v_policy.recommendations_enabled,'used',v_used,'allowance',case when v_test then null else v_allowance end,
    'remaining',case when v_test then null else greatest(v_allowance-v_used,0) end,
    'reset_at',v_reset,'plan',case when v_test then 'test' else v_bucket end,
    'subscription_status',v_entitlement.status,'auto_renews',v_entitlement.auto_renew_status,
    'requires_account',not v_test and v_bucket='free' and v_anonymous and v_used>=v_allowance,
    'requires_full_access',not v_test and v_used>=v_allowance,
    'full_access',v_bucket in ('monthly','annual'),'test_access',v_test,'free_used',v_free_used
  );
end $$;

create or replace function public.reserve_recommendation(
  p_request_id uuid,p_installation_id uuid,p_installation_token text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_user uuid:=auth.uid();v_anonymous boolean;v_policy public.usage_policies;v_existing public.usage_events;
  v_test boolean:=false;v_count bigint;v_bucket text;v_allowance integer;v_entitlement public.entitlements;
  v_plan public.subscription_products;v_period_start timestamptz;v_period_end timestamptz;
  v_day_start timestamptz:=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
  v_month_start timestamptz:=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC';
  v_day public.operator_budget_periods;v_month public.operator_budget_periods;v_stale public.usage_events;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_installation_token is null or p_installation_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid installation session' using errcode='42501'; end if;
  -- Account lock serializes concurrent requests across multiple installations.
  perform 1 from auth.users where id=v_user for update;
  perform 1 from public.installations i join public.installation_sessions s on s.installation_id=i.id
    where i.id=p_installation_id and s.user_id=v_user
      and i.installation_token_hash=extensions.digest(p_installation_token,'sha256') for update of i;
  if not found then raise exception 'Invalid installation session' using errcode='42501'; end if;
  select * into v_existing from public.usage_events where user_id=v_user and request_id=p_request_id and event_type='recommendation';
  if found then return jsonb_build_object('reserved',v_existing.status in ('reserved','completed'),'existing',true,'status',v_existing.status); end if;
  select * into v_policy from public.usage_policies where id='default' for update;
  if not v_policy.recommendations_enabled then raise exception 'Recommendations are disabled' using errcode='P0001'; end if;

  -- Reclaim abandoned reservations only after their lease is safely beyond the Edge Function timeout.
  for v_stale in select * from public.usage_events where status='reserved' and reservation_expires_at<now() for update skip locked loop
    if v_stale.budget_day_start is not null then update public.operator_budget_periods
      set reserved_cost_usd=greatest(0,reserved_cost_usd-v_stale.reserved_cost_usd),updated_at=now()
      where period_kind='day' and period_start=v_stale.budget_day_start; end if;
    if v_stale.budget_month_start is not null then update public.operator_budget_periods
      set reserved_cost_usd=greatest(0,reserved_cost_usd-v_stale.reserved_cost_usd),updated_at=now()
      where period_kind='month' and period_start=v_stale.budget_month_start; end if;
    update public.usage_events set status='failed',metadata=metadata||'{"failure":"reservation_expired"}'::jsonb where id=v_stale.id;
  end loop;

  select exists(select 1 from public.recommendation_test_access a where a.active
    and (a.expires_at is null or a.expires_at>now()) and (a.user_id=v_user or a.installation_id=p_installation_id)) into v_test;
  if (select count(*) from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and created_at>now()-interval '1 minute' and (installation_id=p_installation_id or user_id=v_user)) >= v_policy.recommendation_rate_limit_per_minute
    then raise exception 'Recommendation minute rate limit exceeded' using errcode='P0001'; end if;
  if (select count(*) from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and created_at>now()-interval '24 hours' and (installation_id=p_installation_id or user_id=v_user)) >= v_policy.recommendation_rate_limit_per_day
    then raise exception 'Recommendation daily rate limit exceeded' using errcode='P0001'; end if;

  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select e.* into v_entitlement from public.entitlements e join public.subscription_products p on p.product_id=e.product_id
    where e.user_id=v_user and e.status in ('active','grace_period') and e.verified_at is not null
      and e.current_period_start<=now() and e.current_period_end>now() and p.active
    order by e.current_period_end desc limit 1;
  if found then
    select * into v_plan from public.subscription_products where product_id=v_entitlement.product_id;
    v_bucket:=v_plan.plan_code;v_allowance:=v_plan.recommendation_allowance;
    v_period_start:=v_entitlement.current_period_start;v_period_end:=v_entitlement.current_period_end;
    select count(*) into v_count from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and user_id=v_user and entitlement_id=v_entitlement.id and created_at>=v_period_start and created_at<v_period_end;
  else
    v_bucket:='free';v_allowance:=v_policy.anonymous_allowance;
    select count(*) into v_count from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
      and allowance_bucket='free' and (installation_id=p_installation_id or (v_anonymous is false and user_id=v_user));
  end if;
  if not v_test and v_count>=v_allowance then
    if v_bucket='monthly' then raise exception 'Monthly recommendation allowance exhausted' using errcode='P0001';
    elsif v_bucket='annual' then raise exception 'Annual recommendation allowance exhausted' using errcode='P0001';
    else raise exception 'Free recommendation allowance exhausted' using errcode='P0001'; end if;
  end if;

  if v_policy.global_budgets_enabled then
    insert into public.operator_budget_periods(period_kind,period_start,period_end) values
      ('day',v_day_start,v_day_start+interval '1 day'),('month',v_month_start,v_month_start+interval '1 month') on conflict do nothing;
    select * into v_day from public.operator_budget_periods where period_kind='day' and period_start=v_day_start for update;
    select * into v_month from public.operator_budget_periods where period_kind='month' and period_start=v_month_start for update;
    if v_day.reserved_cost_usd+v_day.committed_cost_usd+v_policy.recommendation_cost_reservation_usd>v_policy.global_daily_budget_usd then
      insert into public.operator_alert_events(alert_type,period_start,observed_cost_usd,ceiling_usd)
        values('daily_ceiling',v_day_start,v_day.reserved_cost_usd+v_day.committed_cost_usd,v_policy.global_daily_budget_usd) on conflict do nothing;
      raise exception 'Global operator budget unavailable' using errcode='P0001'; end if;
    if v_month.reserved_cost_usd+v_month.committed_cost_usd+v_policy.recommendation_cost_reservation_usd>v_policy.global_monthly_budget_usd then
      insert into public.operator_alert_events(alert_type,period_start,observed_cost_usd,ceiling_usd)
        values('monthly_ceiling',v_month_start,v_month.reserved_cost_usd+v_month.committed_cost_usd,v_policy.global_monthly_budget_usd) on conflict do nothing;
      raise exception 'Global operator budget unavailable' using errcode='P0001'; end if;
    update public.operator_budget_periods set reserved_cost_usd=reserved_cost_usd+v_policy.recommendation_cost_reservation_usd,updated_at=now()
      where (period_kind='day' and period_start=v_day_start) or (period_kind='month' and period_start=v_month_start);
    insert into public.operator_alert_events(alert_type,period_start,observed_cost_usd,ceiling_usd)
      select 'daily_warning',v_day_start,v_day.reserved_cost_usd+v_day.committed_cost_usd+v_policy.recommendation_cost_reservation_usd,v_policy.global_daily_budget_usd
      where v_day.reserved_cost_usd+v_day.committed_cost_usd+v_policy.recommendation_cost_reservation_usd>=v_policy.global_daily_budget_usd*v_policy.global_warning_ratio on conflict do nothing;
    insert into public.operator_alert_events(alert_type,period_start,observed_cost_usd,ceiling_usd)
      select 'monthly_warning',v_month_start,v_month.reserved_cost_usd+v_month.committed_cost_usd+v_policy.recommendation_cost_reservation_usd,v_policy.global_monthly_budget_usd
      where v_month.reserved_cost_usd+v_month.committed_cost_usd+v_policy.recommendation_cost_reservation_usd>=v_policy.global_monthly_budget_usd*v_policy.global_warning_ratio on conflict do nothing;
  end if;

  insert into public.usage_events(user_id,installation_id,event_type,request_id,status,metadata,
    allowance_bucket,entitlement_id,allowance_period_start,allowance_period_end,reserved_cost_usd,reservation_expires_at,budget_day_start,budget_month_start)
  values(v_user,p_installation_id,'recommendation',p_request_id,'reserved',jsonb_build_object('phase','recommendation_v2','test_access',v_test),
    case when v_test then 'test' else v_bucket end,v_entitlement.id,v_period_start,v_period_end,
    case when v_policy.global_budgets_enabled then v_policy.recommendation_cost_reservation_usd else 0 end,
    now()+make_interval(mins=>v_policy.reservation_ttl_minutes),
    case when v_policy.global_budgets_enabled then v_day_start end,case when v_policy.global_budgets_enabled then v_month_start end);
  return jsonb_build_object('reserved',true,'existing',false,'status','reserved','plan',case when v_test then 'test' else v_bucket end,
    'remaining_after_reservation',case when v_test then null else greatest(v_allowance-v_count-1,0) end,'reset_at',v_period_end);
end $$;

create or replace function public.finish_recommendation_usage(
  p_request_id uuid,p_status text,p_metadata jsonb default '{}',p_actual_cost_usd numeric default 0
) returns boolean language plpgsql security definer set search_path='' as $$
declare v_event public.usage_events;
begin
  if p_status not in ('completed','failed','cancelled') then raise exception 'Invalid terminal status'; end if;
  if jsonb_typeof(coalesce(p_metadata,'{}'))<>'object' then raise exception 'Invalid metadata'; end if;
  if p_actual_cost_usd<0 or p_actual_cost_usd>10 then raise exception 'Invalid actual cost'; end if;
  select * into v_event from public.usage_events where request_id=p_request_id and event_type='recommendation' and status='reserved' for update;
  if not found then return false; end if;
  if v_event.budget_day_start is not null then update public.operator_budget_periods set
    reserved_cost_usd=greatest(0,reserved_cost_usd-v_event.reserved_cost_usd),
    committed_cost_usd=committed_cost_usd+p_actual_cost_usd,
    completed_requests=completed_requests+case when p_status='completed' then 1 else 0 end,updated_at=now()
    where period_kind='day' and period_start=v_event.budget_day_start; end if;
  if v_event.budget_month_start is not null then update public.operator_budget_periods set
    reserved_cost_usd=greatest(0,reserved_cost_usd-v_event.reserved_cost_usd),
    committed_cost_usd=committed_cost_usd+p_actual_cost_usd,
    completed_requests=completed_requests+case when p_status='completed' then 1 else 0 end,updated_at=now()
    where period_kind='month' and period_start=v_event.budget_month_start; end if;
  update public.usage_events set status=p_status,actual_cost_usd=case when p_status='completed' then p_actual_cost_usd else null end,
    reservation_expires_at=null,metadata=metadata||coalesce(p_metadata,'{}') where id=v_event.id;
  return true;
end $$;

create or replace function public.get_operator_cost_status() returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('enabled',p.global_budgets_enabled,'daily_ceiling_usd',p.global_daily_budget_usd,
    'monthly_ceiling_usd',p.global_monthly_budget_usd,'warning_ratio',p.global_warning_ratio,
    'daily',coalesce((select to_jsonb(b) from public.operator_budget_periods b where b.period_kind='day' and b.period_start=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'),'{}'::jsonb),
    'monthly',coalesce((select to_jsonb(b) from public.operator_budget_periods b where b.period_kind='month' and b.period_start=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC'),'{}'::jsonb))
  from public.usage_policies p where p.id='default'
$$;

create or replace function public.apply_apple_subscription(
  p_user_id uuid,p_product_id text,p_original_transaction_id text,p_latest_transaction_id text,
  p_period_start timestamptz,p_period_end timestamptz,p_status text,p_environment text,
  p_auto_renew boolean,p_app_account_token uuid,p_ownership_type text,p_raw_status jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_plan text;v_id uuid;
begin
  if auth.role()<>'service_role' then raise exception 'Service role required' using errcode='42501'; end if;
  if p_user_id is null or p_app_account_token is distinct from p_user_id then raise exception 'App account token mismatch' using errcode='42501'; end if;
  if p_original_transaction_id is null or length(p_original_transaction_id)>200 or p_latest_transaction_id is null or length(p_latest_transaction_id)>200
    then raise exception 'Invalid transaction identity'; end if;
  if p_status not in ('active','grace_period','billing_retry','expired','revoked','refunded','pending') then raise exception 'Invalid entitlement status'; end if;
  if p_environment not in ('Sandbox','Production') then raise exception 'Invalid Apple environment'; end if;
  if jsonb_typeof(coalesce(p_raw_status,'{}'))<>'object' then raise exception 'Invalid status metadata'; end if;
  select plan_code into v_plan from public.subscription_products where product_id=p_product_id and active;
  if v_plan is null then raise exception 'Unknown subscription product'; end if;
  insert into public.entitlements(user_id,product_id,source,status,original_transaction_id,verified_at,plan_code,
    current_period_start,current_period_end,environment,auto_renew_status,app_account_token,latest_transaction_id,ownership_type,revoked_at,raw_status)
  values(p_user_id,p_product_id,'apple',p_status,p_original_transaction_id,now(),v_plan,p_period_start,p_period_end,p_environment,
    p_auto_renew,p_app_account_token,p_latest_transaction_id,p_ownership_type,
    case when p_status in ('revoked','refunded') then now() end,coalesce(p_raw_status,'{}'))
  on conflict(original_transaction_id) do update set
    product_id=excluded.product_id,status=excluded.status,verified_at=now(),plan_code=excluded.plan_code,
    current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end,
    environment=excluded.environment,auto_renew_status=excluded.auto_renew_status,
    latest_transaction_id=excluded.latest_transaction_id,ownership_type=excluded.ownership_type,
    revoked_at=excluded.revoked_at,raw_status=excluded.raw_status,updated_at=now()
  where public.entitlements.user_id=excluded.user_id and public.entitlements.app_account_token=excluded.app_account_token
  returning id into v_id;
  if v_id is null then raise exception 'Subscription belongs to another account' using errcode='42501'; end if;
  return v_id;
end $$;

revoke execute on function public.finish_recommendation_usage(uuid,text,jsonb) from public,anon,authenticated,service_role;
drop function public.finish_recommendation_usage(uuid,text,jsonb);
revoke execute on function public.finish_recommendation_usage(uuid,text,jsonb,numeric),public.get_operator_cost_status() from public,anon,authenticated;
revoke execute on function public.apply_apple_subscription(uuid,text,text,text,timestamptz,timestamptz,text,text,boolean,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.finish_recommendation_usage(uuid,text,jsonb,numeric),public.get_operator_cost_status(),
  public.apply_apple_subscription(uuid,text,text,text,timestamptz,timestamptz,text,text,boolean,uuid,text,jsonb) to service_role;
revoke execute on function public.get_usage_status(uuid,text),public.reserve_recommendation(uuid,uuid,text) from public,anon;
grant execute on function public.get_usage_status(uuid,text),public.reserve_recommendation(uuid,uuid,text) to authenticated,service_role;

comment on table public.subscription_products is 'Server-authoritative plan definitions. Product IDs must be confirmed in App Store Connect before sale.';
comment on table public.operator_budget_periods is 'Server-only atomic reservations and measured model cost; never exposed to clients.';
comment on function public.reserve_recommendation(uuid,uuid,text) is 'Atomic replay, identity, rate, allowance and operator-budget reservation before any paid model call.';
comment on function public.finish_recommendation_usage(uuid,text,jsonb,numeric) is 'Service-only terminal accounting. Failed calls release operator budget and do not consume recommendation allowance.';
