create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  display_name text check (length(display_name) <= 100),
  preferred_music_service text check (preferred_music_service in ('spotify','apple')),
  onboarding_completed boolean not null default false
);
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id) values (new.id) on conflict do nothing; return new; end $$;
create trigger which_drake_profile after insert on auth.users for each row execute function public.create_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;

create table public.installations (
  id uuid primary key,
  installation_token_hash bytea not null check (octet_length(installation_token_hash) = 32),
  created_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  platform text not null check (platform in ('ios','android','web')),
  app_version text not null check (length(app_version) <= 40)
);
-- Includes anonymous Auth sessions; an installation is not an Auth user.
create table public.installation_sessions (
  installation_id uuid not null references public.installations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
  primary key (installation_id,user_id)
);
create index installation_sessions_user on public.installation_sessions(user_id);

create table public.usage_policies (
  id text primary key check (id = 'default'),
  recommendations_enabled boolean not null default false,
  anonymous_allowance integer not null default 3 check (anonymous_allowance between 0 and 100),
  account_allowance integer not null default 0 check (account_allowance >= 0),
  updated_at timestamptz not null default now()
);
insert into public.usage_policies(id) values ('default');
create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  installation_id uuid not null references public.installations(id) on delete restrict,
  event_type text not null check (event_type in ('recommendation','reservation','refund','abuse_signal')),
  request_id uuid not null,
  status text not null check (status in ('reserved','completed','failed','cancelled')),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (installation_id,request_id,event_type)
);
comment on column public.usage_events.metadata is 'Operational metadata only: never prompts, tokens, or full IP addresses. Trusted server writes only.';
create index usage_events_installation on public.usage_events(installation_id,created_at);
create index usage_events_user on public.usage_events(user_id,created_at);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null, source text not null check (source in ('apple','admin')),
  status text not null check (status in ('active','expired','revoked','pending')),
  original_transaction_id text unique, verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (status <> 'active' or verified_at is not null)
);
create index entitlements_user on public.entitlements(user_id);
create trigger entitlements_updated before update on public.entitlements for each row execute function public.touch_updated_at();

create function public.register_installation(p_id uuid, p_token text, p_platform text, p_app_version text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_hash bytea; v_existing bytea; v_anonymous boolean;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid installation proof'; end if;
  v_hash := extensions.digest(p_token,'sha256');
  select is_anonymous into v_anonymous from auth.users where id = v_user;
  insert into public.installations(id,installation_token_hash,platform,app_version)
    values(p_id,v_hash,p_platform,p_app_version) on conflict(id) do nothing;
  select installation_token_hash into v_existing from public.installations where id = p_id for update;
  if v_existing <> v_hash then raise exception 'Invalid installation proof' using errcode='42501'; end if;
  update public.installations set last_seen_at=now(), app_version=p_app_version,
    user_id=case when v_anonymous is false then v_user else user_id end where id=p_id;
  insert into public.installation_sessions(installation_id,user_id) values(p_id,v_user)
    on conflict(installation_id,user_id) do update set last_seen_at=now();
  return p_id;
end $$;

create function public.get_usage_status(p_id uuid, p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_anonymous boolean; v_count bigint; v_policy public.usage_policies; v_full boolean;
begin
  if v_user is null or not exists(select 1 from public.installation_sessions s join public.installations i on i.id=s.installation_id
    where s.installation_id=p_id and s.user_id=v_user and i.installation_token_hash=extensions.digest(p_token,'sha256'))
    then raise exception 'Invalid installation session' using errcode='42501'; end if;
  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select * into v_policy from public.usage_policies where id='default';
  -- Union predicate counts each event once; switching accounts cannot erase installation usage.
  select count(*) into v_count from public.usage_events where event_type='recommendation'
    and status in ('reserved','completed') and (installation_id=p_id or (v_anonymous is false and user_id=v_user));
  select exists(select 1 from public.entitlements where user_id=v_user and status='active' and verified_at is not null) into v_full;
  return jsonb_build_object('enabled',v_policy.recommendations_enabled,'used',v_count,
    'allowance',case when v_full then null when v_anonymous then v_policy.anonymous_allowance else v_policy.account_allowance end,
    'requires_account',v_anonymous and v_count >= v_policy.anonymous_allowance,'full_access',v_full);
end $$;
comment on function public.get_usage_status(uuid,text) is 'Read-only status. Never authorizes an AI request. A future trusted endpoint must atomically reserve allowance, rate-limit and verify abuse signals before calling AI.';

alter table public.profiles enable row level security;
alter table public.installations enable row level security;
alter table public.installation_sessions enable row level security;
alter table public.usage_policies enable row level security;
alter table public.usage_events enable row level security;
alter table public.entitlements enable row level security;
revoke all on public.profiles,public.installations,public.installation_sessions,public.usage_policies,public.usage_events,public.entitlements from anon,authenticated;
grant select on public.profiles,public.entitlements to authenticated;
grant update(display_name,preferred_music_service,onboarding_completed) on public.profiles to authenticated;
create policy profiles_self_select on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy entitlements_self_select on public.entitlements for select to authenticated using (user_id=(select auth.uid()));
grant all on public.profiles,public.installations,public.installation_sessions,public.usage_policies,public.usage_events,public.entitlements to service_role;
revoke execute on function public.touch_updated_at(),public.create_profile() from public,anon,authenticated;
revoke execute on function public.register_installation(uuid,text,text,text),public.get_usage_status(uuid,text) from public,anon;
grant execute on function public.register_installation(uuid,text,text,text),public.get_usage_status(uuid,text) to authenticated,service_role;
