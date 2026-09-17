-- Phase 3 semantic intelligence: additive fields and evidence. No catalog membership changes.
alter table public.song_analysis_profiles
  add column schema_version integer not null default 1 check(schema_version > 0),
  add column central_conflict text,
  add column perspective text,
  add column emotional_arc jsonb not null default '{}' check(jsonb_typeof(emotional_arc)='object'),
  add column energy_tone text[] not null default '{}',
  add column analysis_input_hash text check(analysis_input_hash is null or analysis_input_hash ~ '^[a-f0-9]{64}$'),
  add column generator_response_id text,
  add column generation_metadata jsonb not null default '{}' check(jsonb_typeof(generation_metadata)='object'),
  add column uncertainties text[] not null default '{}';

alter table public.song_scenarios
  add column scenario_key text check(scenario_key is null or scenario_key ~ '^[a-f0-9]{64}$');
create unique index song_scenarios_versioned_key on public.song_scenarios(profile_id,scenario_key) where scenario_key is not null;

create table public.song_analysis_sources (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.song_analysis_profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id),
  source_type text not null check(source_type in ('curator_calibration','catalog_metadata','official_release','review','interview','other')),
  source_url text,
  source_title text not null,
  publisher text,
  evidence_notes text not null check(length(evidence_notes) between 1 and 1200),
  supports text[] not null default '{}',
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key(profile_id,song_id) references public.song_analysis_profiles(id,song_id),
  unique(profile_id,source_type,source_title)
);
comment on table public.song_analysis_sources is 'Short factual/contextual evidence and original summaries only. Never store complete lyrics.';

create function public.valid_song_intelligence(
  p_review public.review_status,p_core text,p_detail text,p_conflict text,p_perspective text,
  p_primary text[],p_emotions text[],p_tone text[],p_strong text[],p_negative text[],p_confidence numeric
) returns boolean language sql immutable set search_path='' as $$
  select case when p_review in ('generated','needs_review','approved') then
    length(trim(coalesce(p_core,''))) >= 20 and length(trim(coalesce(p_detail,''))) >= 80
    and length(trim(coalesce(p_conflict,''))) >= 15 and length(trim(coalesce(p_perspective,''))) >= 10
    and cardinality(p_primary) >= 2 and cardinality(p_emotions) >= 2 and cardinality(p_tone) >= 2
    and cardinality(p_strong) >= 3 and cardinality(p_negative) >= 3 and p_confidence is not null
  else true end
$$;
alter table public.song_analysis_profiles add constraint song_intelligence_complete check(public.valid_song_intelligence(
  review_status,core_meaning,detailed_interpretation,central_conflict,perspective,
  primary_themes,emotional_tone,energy_tone,strong_fit_scenarios,negative_fit_scenarios,analysis_confidence
));

-- Failed jobs below the attempt cap become retryable on the next worker run.
drop function public.claim_analysis_job(text,integer,text);
create function public.claim_analysis_job(
  p_job_type text,
  p_lease_seconds integer default 300,
  p_analysis_version text default null,
  p_exclude_song_ids uuid[] default '{}'
)
returns setof public.analysis_jobs language plpgsql security definer set search_path='' as $$
begin
  if p_lease_seconds is null or p_lease_seconds not between 30 and 3600 then raise exception 'Invalid lease'; end if;
  update public.analysis_jobs set status='failed',last_error='Lease expired; attempt limit reached',completed_at=now(),lease_expires_at=null
    where job_type=p_job_type and status='processing' and lease_expires_at < now() and attempt_count >= max_attempts
      and (p_analysis_version is null or analysis_version=p_analysis_version);
  return query with candidate as (
    select id from public.analysis_jobs where job_type=p_job_type and attempt_count < max_attempts
      and (p_analysis_version is null or analysis_version=p_analysis_version)
      and not (song_id = any(coalesce(p_exclude_song_ids,'{}'::uuid[])))
      and (status in ('pending','failed') or (status='processing' and lease_expires_at < now()))
    order by created_at for update skip locked limit 1
  ) update public.analysis_jobs j set status='processing',attempt_count=j.attempt_count+1,
      lease_token=gen_random_uuid(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds),started_at=now(),completed_at=null
    from candidate c where j.id=c.id returning j.*;
end $$;

alter table public.song_analysis_sources enable row level security;
revoke all on public.song_analysis_sources from anon,authenticated;
grant all on public.song_analysis_sources to service_role;
revoke execute on function public.valid_song_intelligence(public.review_status,text,text,text,text,text[],text[],text[],text[],text[],numeric),public.claim_analysis_job(text,integer,text,uuid[]) from public,anon,authenticated;
grant execute on function public.claim_analysis_job(text,integer,text,uuid[]) to service_role;
