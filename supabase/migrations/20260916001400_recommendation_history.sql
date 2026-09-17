create table public.recommendation_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete restrict,
  situation_text text not null check (char_length(situation_text) between 8 and 1500),
  result_payload jsonb not null check (jsonb_typeof(result_payload) = 'object' and result_payload->>'outcome' = 'match'),
  created_at timestamptz not null default now()
);

create index recommendation_history_user_created_idx
  on public.recommendation_history(user_id, created_at desc);

alter table public.recommendation_history enable row level security;
revoke all on public.recommendation_history from public, anon, authenticated;
grant select, delete on public.recommendation_history to authenticated;
grant all on public.recommendation_history to service_role;

create policy recommendation_history_select_own on public.recommendation_history
  for select to authenticated using (user_id = auth.uid());

create policy recommendation_history_delete_own on public.recommendation_history
  for delete to authenticated using (user_id = auth.uid());

comment on table public.recommendation_history is
  'User-private successful recommendation history. Situation text is retained only for this user-facing feature and is protected by RLS.';
