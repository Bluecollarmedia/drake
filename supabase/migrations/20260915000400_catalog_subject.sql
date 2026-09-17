-- Trusted, explicitly configured catalog subject; never infer artist identity from a name alone.
create table public.catalog_subjects (
  slug text primary key, artist_id uuid not null references public.artists(id),
  source_notes jsonb not null, created_at timestamptz not null default now()
);
alter table public.catalog_subjects enable row level security;
revoke all on public.catalog_subjects from anon,authenticated;
grant all on public.catalog_subjects to service_role;
