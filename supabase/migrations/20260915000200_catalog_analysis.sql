create extension if not exists vector with schema extensions;
create type public.review_status as enum ('unprocessed','generated','needs_review','approved','rejected');
create type public.job_status as enum ('pending','processing','completed','failed','needs_review');

create table public.artists (
  id uuid primary key default gen_random_uuid(), name text not null, normalized_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.artist_provider_ids (
  provider text not null check(provider in ('spotify','apple')), provider_id text not null,
  artist_id uuid not null references public.artists(id), url text,
  primary key(provider,provider_id)
);
create table public.releases (
  id uuid primary key default gen_random_uuid(), title text not null, normalized_title text not null,
  release_type text not null check(release_type in ('album','mixtape','ep','single','compilation','unknown')),
  release_date date, date_precision text check(date_precision in ('day','month','year')),
  upc text, artwork jsonb not null default '[]', track_count integer check(track_count >= 0),
  edition text, storefront text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.release_provider_ids (
  provider text not null check(provider in ('spotify','apple')), provider_id text not null,
  release_id uuid not null references public.releases(id), url text,
  fetched_at timestamptz not null default now(), primary key(provider,provider_id)
);
create table public.release_artists (
  release_id uuid not null references public.releases(id) on delete cascade,
  artist_id uuid not null references public.artists(id), credit_order integer not null check(credit_order >= 0),
  primary key(release_id,artist_id)
);
create table public.songs (
  id uuid primary key default gen_random_uuid(), title text not null, normalized_title text not null,
  primary_artist_id uuid references public.artists(id), version_key text not null default 'original',
  duration_ms integer check(duration_ms > 0), explicit boolean,
  identity_review_status public.review_status not null default 'unprocessed',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index songs_identity_candidates on public.songs(normalized_title,primary_artist_id,version_key);
create table public.song_artists (
  song_id uuid not null references public.songs(id) on delete cascade, artist_id uuid not null references public.artists(id),
  role text not null check(role in ('primary','featured','collaborator','unknown')), credit_order integer not null check(credit_order >= 0),
  role_provenance text not null, primary key(song_id,artist_id)
);
create table public.song_recording_codes (
  song_id uuid not null references public.songs(id), isrc text not null check(isrc ~ '^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$'),
  source_provider text not null check(source_provider in ('spotify','apple')), primary key(song_id,isrc)
);
-- ISRC is evidence, not a globally unique guarantee of canonical identity.
create index song_recording_codes_isrc on public.song_recording_codes(isrc);
create table public.song_provider_ids (
  provider text not null check(provider in ('spotify','apple')), provider_id text not null,
  song_id uuid not null references public.songs(id), url text, fetched_at timestamptz not null default now(),
  primary key(provider,provider_id)
);
create table public.release_tracks (
  id uuid primary key default gen_random_uuid(), release_id uuid not null references public.releases(id),
  song_id uuid not null references public.songs(id), track_number integer not null check(track_number > 0),
  disc_number integer not null default 1 check(disc_number > 0),
  appearance_title text not null, duration_ms integer check(duration_ms > 0), explicit boolean,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(release_id,disc_number,track_number)
);
create index release_tracks_song on public.release_tracks(song_id);
create table public.appearance_provider_ids (
  appearance_id uuid not null references public.release_tracks(id) on delete cascade,
  provider text not null check(provider in ('spotify','apple')), provider_id text not null,
  primary key(appearance_id,provider)
);
create table public.catalog_imports (
  id uuid primary key default gen_random_uuid(), provider text not null check(provider in ('spotify','apple')),
  started_at timestamptz not null default now(), completed_at timestamptz,
  status text not null default 'processing' check(status in ('processing','completed','failed','partial')),
  coverage jsonb not null, report jsonb not null default '{}'
);
create table public.duplicate_reviews (
  id uuid primary key default gen_random_uuid(), song_a_id uuid not null references public.songs(id),
  song_b_id uuid not null references public.songs(id), evidence jsonb not null,
  status text not null default 'pending' check(status in ('pending','merged','distinct','dismissed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(song_a_id < song_b_id), unique(song_a_id,song_b_id)
);

create function public.valid_dimensions(p_value jsonb) returns boolean language sql immutable set search_path='' as $$
  select case when jsonb_typeof(p_value) <> 'object' then false else not exists(
    select 1 from jsonb_each(p_value) e where case when jsonb_typeof(e.value)='number'
      then (e.value::text)::numeric not between 0 and 1 else true end) end
$$;
create table public.song_analysis_profiles (
  id uuid primary key default gen_random_uuid(), song_id uuid not null references public.songs(id),
  analysis_version text not null, core_meaning text, detailed_interpretation text,
  primary_themes text[] not null default '{}', secondary_themes text[] not null default '{}',
  emotional_tone text[] not null default '{}', emotional_intensity numeric check(emotional_intensity between 0 and 1),
  emotional_dimensions jsonb not null default '{}' check(public.valid_dimensions(emotional_dimensions)),
  narrator_state jsonb not null default '{}' check(jsonb_typeof(narrator_state)='object'),
  other_person_state jsonb not null default '{}' check(jsonb_typeof(other_person_state)='object'),
  relationship jsonb not null default '{}' check(jsonb_typeof(relationship)='object'),
  narrative jsonb not null default '{}' check(jsonb_typeof(narrative)='object'),
  context jsonb not null default '{}' check(jsonb_typeof(context)='object'),
  nuances text[] not null default '{}', strong_fit_scenarios text[] not null default '{}',
  moderate_fit_scenarios text[] not null default '{}', negative_fit_scenarios text[] not null default '{}',
  analysis_confidence numeric check(analysis_confidence between 0 and 1), analysis_model text, analyzed_at timestamptz,
  review_status public.review_status not null default 'unprocessed', manually_edited boolean not null default false,
  human_edits jsonb not null default '[]' check(jsonb_typeof(human_edits)='array'),
  provenance jsonb not null default '[]' check(jsonb_typeof(provenance)='array'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(song_id,analysis_version), unique(id,song_id)
);
comment on column public.song_analysis_profiles.emotional_dimensions is '0..1 dimensions, extensible: attachment, attraction, sexual_desire, love, sadness, anger, jealousy, guilt, nostalgia, confidence, loneliness, resentment, hope, acceptance, ambition, grief, betrayal, reconciliation, success, money, fame, family, friendship.';
comment on column public.song_analysis_profiles.relationship is 'Versioned object: type, stage, conflict. No full lyrics.';
comment on column public.song_analysis_profiles.narrative is 'Versioned object: before, current_situation, narrator_wants, narrator_fears, narrator_regrets.';
comment on column public.song_analysis_profiles.context is 'Versioned object: life_stage, setting, perspective, circumstances.';
create table public.song_scenarios (
  id uuid primary key default gen_random_uuid(), song_id uuid not null references public.songs(id),
  profile_id uuid, scenario_text text not null check(length(scenario_text) between 1 and 3000),
  fit_strength text not null check(fit_strength in ('strong','moderate','negative')),
  scenario_type text not null, variation jsonb not null default '{}' check(jsonb_typeof(variation)='object'),
  source text not null, review_status public.review_status not null default 'unprocessed',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(profile_id,song_id) references public.song_analysis_profiles(id,song_id), unique(id,song_id)
);
create table public.song_relationships (
  id uuid primary key default gen_random_uuid(), song_id uuid not null references public.songs(id),
  related_song_id uuid not null references public.songs(id), relationship_type text not null check(relationship_type in ('similar','easily_confused','contrast','alternate_version')),
  shared_concepts text[] not null default '{}', important_distinctions text not null,
  analysis_version text not null, review_status public.review_status not null default 'unprocessed',
  provenance jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(song_id <> related_song_id), unique(song_id,related_song_id,relationship_type,analysis_version)
);
create table public.embedding_models (
  id text primary key, dimensions integer not null check(dimensions > 0),
  distance_metric text not null check(distance_metric in ('cosine','inner_product','l2')),
  enabled boolean not null default false, created_at timestamptz not null default now()
);
-- No model has been chosen. An unbounded vector column accepts registered dimensions;
-- add model-specific partial indexes/casts once a model and dimensions are approved.
create table public.song_embeddings (
  id uuid primary key default gen_random_uuid(), song_id uuid not null references public.songs(id),
  scenario_id uuid, profile_id uuid,
  embedding_type text not null check(embedding_type in ('overall_song_meaning','scenario','situational_summary','theme_profile')),
  embedding extensions.vector not null, embedding_model text not null references public.embedding_models(id),
  analysis_version text not null, source_hash text not null, created_at timestamptz not null default now(),
  foreign key(scenario_id,song_id) references public.song_scenarios(id,song_id),
  foreign key(profile_id,song_id) references public.song_analysis_profiles(id,song_id),
  check((embedding_type='scenario') = (scenario_id is not null)),
  unique nulls not distinct(song_id,scenario_id,embedding_type,embedding_model,analysis_version)
);
create function public.validate_embedding() returns trigger language plpgsql set search_path='' as $$
declare v_dimensions integer; v_enabled boolean;
begin
  select dimensions,enabled into v_dimensions,v_enabled from public.embedding_models where id=new.embedding_model;
  if v_enabled is not true or extensions.vector_dims(new.embedding) <> v_dimensions then raise exception 'Embedding model or dimensions not approved'; end if;
  return new;
end $$;
create trigger song_embedding_validate before insert or update on public.song_embeddings for each row execute function public.validate_embedding();

create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(), song_id uuid not null references public.songs(id),
  job_type text not null check(job_type in ('profile','scenarios','comparison','embedding')),
  status public.job_status not null default 'pending', attempt_count integer not null default 0 check(attempt_count >= 0),
  max_attempts integer not null default 3 check(max_attempts > 0), last_error text,
  analysis_version text not null, lease_token uuid, lease_expires_at timestamptz,
  started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(song_id,job_type,analysis_version)
);
create index analysis_jobs_pending on public.analysis_jobs(status,created_at);
create function public.claim_analysis_job(p_job_type text, p_lease_seconds integer default 300)
returns setof public.analysis_jobs language plpgsql security definer set search_path='' as $$
begin
  if p_lease_seconds not between 30 and 3600 then raise exception 'Invalid lease'; end if;
  return query with candidate as (
    select id from public.analysis_jobs where job_type=p_job_type and attempt_count < max_attempts
      and (status='pending' or (status='processing' and lease_expires_at < now()))
    order by created_at for update skip locked limit 1
  ) update public.analysis_jobs j set status='processing', attempt_count=j.attempt_count+1,
      lease_token=gen_random_uuid(), lease_expires_at=now()+make_interval(secs=>p_lease_seconds), started_at=now(), completed_at=null
    from candidate c where j.id=c.id returning j.*;
end $$;
create function public.finish_analysis_job(p_id uuid,p_lease_token uuid,p_status public.job_status,p_error text default null)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if p_status not in ('completed','failed','needs_review') then raise exception 'Invalid terminal state'; end if;
  update public.analysis_jobs set status=p_status,last_error=left(p_error,2000),completed_at=now(),lease_expires_at=null
    where id=p_id and status='processing' and lease_token=p_lease_token and lease_expires_at > now();
  return found;
end $$;

create table public.saved_recommendations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id), recommendation_explanation text not null check(length(recommendation_explanation) <= 6000),
  original_user_input text check(length(original_user_input) <= 3000), retain_original_input boolean not null default false,
  created_at timestamptz not null default now(),
  check(retain_original_input or original_user_input is null)
);
comment on column public.saved_recommendations.original_user_input is 'NULL by default. Store only with explicit opt-in; app phase 2 never sends original prompts.';
create index saved_recommendations_user on public.saved_recommendations(user_id,created_at);

do $$ declare t text; begin
  foreach t in array array['artists','artist_provider_ids','releases','release_provider_ids','release_artists','songs','song_artists','song_recording_codes','song_provider_ids','release_tracks','appearance_provider_ids','catalog_imports','duplicate_reviews','song_analysis_profiles','song_scenarios','song_relationships','embedding_models','song_embeddings','analysis_jobs'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon,authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
  foreach t in array array['artists','artist_provider_ids','releases','release_provider_ids','release_artists','songs','song_artists','song_recording_codes','song_provider_ids','release_tracks','appearance_provider_ids'] loop
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy catalog_read on public.%I for select to authenticated using (true)',t);
  end loop;
  foreach t in array array['artists','releases','songs','release_tracks','duplicate_reviews','song_analysis_profiles','song_scenarios','song_relationships','analysis_jobs'] loop
    execute format('create trigger updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
  end loop;
end $$;
alter table public.saved_recommendations enable row level security;
revoke all on public.saved_recommendations from anon,authenticated;
grant select,insert,delete on public.saved_recommendations to authenticated;
grant all on public.saved_recommendations to service_role;
create policy saved_self on public.saved_recommendations for all to authenticated
  using(user_id=(select auth.uid()) and coalesce((select auth.jwt()->>'is_anonymous')::boolean,true) is false)
  with check(user_id=(select auth.uid()) and coalesce((select auth.jwt()->>'is_anonymous')::boolean,true) is false);
revoke execute on function public.valid_dimensions(jsonb),public.validate_embedding(),public.claim_analysis_job(text,integer),public.finish_analysis_job(uuid,uuid,public.job_status,text) from public,anon,authenticated;
grant execute on function public.valid_dimensions(jsonb) to authenticated,service_role;
grant execute on function public.claim_analysis_job(text,integer),public.finish_analysis_job(uuid,uuid,public.job_status,text) to service_role;
