-- Preserve the curator's primary artist claim separately from verified performing credits.
-- Existing RLS and revoked client write privileges remain in force.
alter table public.catalog_master_entries add column supplied_primary_artist text;
comment on column public.catalog_master_entries.supplied_primary_artist is
  'Exact supplied Part 2 primary artist claim; enrichment must not silently replace it.';
