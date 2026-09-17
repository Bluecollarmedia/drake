-- Curated membership is independent of metadata provider recording identities.
create table public.catalog_master_lists (
  id uuid primary key default gen_random_uuid(), slug text not null,
  scope text not null check(scope in ('lead_joint_primary','feature_guest')),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'), raw_text text not null,
  active boolean not null default true, created_at timestamptz not null default now(),
  unique(slug,content_hash)
);
create unique index catalog_master_lists_active on public.catalog_master_lists(slug) where active;
create table public.catalog_memberships (
  id uuid primary key default gen_random_uuid(), scope text not null check(scope in ('lead_joint_primary','feature_guest')),
  candidate_key text not null, song_id uuid not null references public.songs(id),
  master_list_id uuid not null references public.catalog_master_lists(id),
  supplied_title text not null, supplied_roles text[] not null,
  active boolean not null default true,
  status text not null check(status in ('approved','needs_review')),
  requires_performance_review boolean not null default false, performance_verified boolean not null default false,
  review_reasons jsonb not null default '[]' check(jsonb_typeof(review_reasons)='array'),
  metadata_summary jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(scope,candidate_key),
  check(status <> 'approved' or not requires_performance_review or performance_verified)
);
create index catalog_memberships_song on public.catalog_memberships(song_id);
create table public.catalog_master_entries (
  master_list_id uuid not null references public.catalog_master_lists(id), ordinal integer not null check(ordinal > 0),
  song_id uuid not null references public.songs(id), candidate_key text not null,
  raw_entry text not null, supplied_title text not null, supplied_credit text not null, supplied_role text not null,
  supplied_version text not null, qualifier text not null, project text not null,
  supplied_year integer, list_position integer not null check(list_position > 0),
  primary key(master_list_id,ordinal)
);
comment on column public.catalog_master_entries.list_position is 'Position in the supplied list, NOT an asserted official track number.';
create table public.catalog_metadata_reviews (
  id uuid primary key default gen_random_uuid(), membership_id uuid not null references public.catalog_memberships(id),
  review_key text not null, reason text not null, blocking boolean not null default false,
  evidence jsonb not null, status text not null default 'pending' check(status in ('pending','resolved','dismissed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(membership_id,review_key)
);
-- Only approved, active curated membership may enter the future released engine.
-- This is catalog eligibility; no recommendation processing is implemented.
create view public.released_catalog_eligible_songs with (security_invoker=true) as
  select s.* from public.songs s where s.catalog_type='official_released'
    and exists(select 1 from public.catalog_memberships m where m.song_id=s.id and m.active and m.status='approved'
      and (not m.requires_performance_review or m.performance_verified)
      and exists(select 1 from public.catalog_master_lists l where l.id=m.master_list_id and l.active));
do $$ declare t text; begin
  foreach t in array array['catalog_master_lists','catalog_memberships','catalog_master_entries','catalog_metadata_reviews'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
  foreach t in array array['catalog_master_lists','catalog_memberships'] loop
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy catalog_read on public.%I for select to authenticated using (true)',t);
  end loop;
  foreach t in array array['catalog_memberships','catalog_metadata_reviews'] loop
    execute format('create trigger updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
  end loop;
end $$;
revoke all on public.released_catalog_eligible_songs from anon,authenticated;
grant select on public.released_catalog_eligible_songs to authenticated,service_role;
comment on table public.catalog_memberships is 'Curated master lists determine membership; providers enrich only. No automatic provider expansion.';
