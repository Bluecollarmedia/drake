-- Phase 4 recommendation infrastructure. Phase 3 profiles remain immutable inputs.
insert into public.embedding_models(id,dimensions,distance_metric,enabled)
values('text-embedding-3-large-1536',1536,'cosine',true)
on conflict(id) do update set dimensions=excluded.dimensions,distance_metric=excluded.distance_metric,enabled=excluded.enabled;

create table public.embedding_runs (
  id uuid primary key default gen_random_uuid(),
  embedding_model text not null references public.embedding_models(id),
  provider_model text not null,
  document_version text not null,
  analysis_version text not null,
  status text not null default 'running' check(status in ('running','paused','completed','failed')),
  requested_song_count integer not null default 0 check(requested_song_count >= 0),
  embedded_song_count integer not null default 0 check(embedded_song_count >= 0),
  embedded_vector_count integer not null default 0 check(embedded_vector_count >= 0),
  skipped_vector_count integer not null default 0 check(skipped_vector_count >= 0),
  failed_song_count integer not null default 0 check(failed_song_count >= 0),
  input_tokens bigint not null default 0 check(input_tokens >= 0),
  estimated_cost_usd numeric(12,6) not null default 0 check(estimated_cost_usd >= 0),
  settings jsonb not null default '{}' check(jsonb_typeof(settings)='object'),
  last_checkpoint jsonb not null default '{}' check(jsonb_typeof(last_checkpoint)='object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.song_embeddings
  add column document_version text not null default 'legacy-v1',
  add column input_tokens integer not null default 0 check(input_tokens >= 0),
  add column estimated_cost_usd numeric(12,8) not null default 0 check(estimated_cost_usd >= 0),
  add column embedding_run_id uuid references public.embedding_runs(id);

create index song_embeddings_recommendation_lookup
  on public.song_embeddings(embedding_model,analysis_version,embedding_type,song_id);

-- At this catalog size an exact pgvector scan of two vectors per song is both fast and
-- deterministic. Keeping the base column dimension-agnostic preserves future model changes.
create function public.match_recommendation_candidates(
  p_query_embedding extensions.vector(1536),
  p_embedding_model text,
  p_analysis_version text,
  p_limit integer default 20
) returns table(
  song_id uuid,
  profile_id uuid,
  title text,
  overall_similarity double precision,
  situational_similarity double precision,
  retrieval_score double precision
) language sql stable security definer set search_path='' as $$
  with per_song as (
    select se.song_id,se.profile_id,
      max(1-(se.embedding::extensions.vector(1536) operator(extensions.<=>) p_query_embedding))
        filter(where se.embedding_type='overall_song_meaning') as overall_similarity,
      max(1-(se.embedding::extensions.vector(1536) operator(extensions.<=>) p_query_embedding))
        filter(where se.embedding_type='situational_summary') as situational_similarity
    from public.song_embeddings se
    join public.released_catalog_eligible_songs eligible on eligible.id=se.song_id
    join public.song_analysis_profiles profile on profile.id=se.profile_id
      and profile.analysis_version=p_analysis_version
      and profile.review_status in ('generated','needs_review','approved')
    where se.embedding_model=p_embedding_model
      and se.analysis_version=p_analysis_version
      and se.embedding_type in ('overall_song_meaning','situational_summary')
    group by se.song_id,se.profile_id
  )
  select ps.song_id,ps.profile_id,s.title,
    coalesce(ps.overall_similarity,0),coalesce(ps.situational_similarity,0),
    (coalesce(ps.overall_similarity,0)*0.4+coalesce(ps.situational_similarity,0)*0.6) as retrieval_score
  from per_song ps join public.songs s on s.id=ps.song_id
  where ps.overall_similarity is not null and ps.situational_similarity is not null
  order by retrieval_score desc,ps.song_id
  limit greatest(1,least(coalesce(p_limit,20),50));
$$;

alter table public.usage_policies
  add column recommendation_rate_limit_per_minute integer not null default 5 check(recommendation_rate_limit_per_minute between 1 and 100),
  add column recommendation_rate_limit_per_day integer not null default 100 check(recommendation_rate_limit_per_day between 1 and 10000);

create table public.recommendation_runs (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  installation_id uuid not null references public.installations(id) on delete restrict,
  input_hash text not null check(input_hash ~ '^[a-f0-9]{64}$'),
  input_character_count integer not null check(input_character_count between 1 and 1500),
  analysis_version text not null,
  embedding_model text not null references public.embedding_models(id),
  reranking_model text not null,
  shortlist_size integer not null check(shortlist_size between 1 and 50),
  status text not null default 'processing' check(status in ('processing','completed','failed')),
  selected_song_id uuid references public.songs(id),
  confidence numeric check(confidence between 0 and 1),
  retrieved_candidates jsonb not null default '[]' check(jsonb_typeof(retrieved_candidates)='array'),
  result_payload jsonb check(result_payload is null or jsonb_typeof(result_payload)='object'),
  embedding_input_tokens integer not null default 0 check(embedding_input_tokens >= 0),
  reranking_input_tokens integer not null default 0 check(reranking_input_tokens >= 0),
  reranking_cached_input_tokens integer not null default 0 check(reranking_cached_input_tokens >= 0),
  reranking_output_tokens integer not null default 0 check(reranking_output_tokens >= 0),
  estimated_cost_usd numeric(12,8) not null default 0 check(estimated_cost_usd >= 0),
  model_snapshot text,
  error_code text,
  expires_at timestamptz not null default now()+interval '24 hours',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
comment on table public.recommendation_runs is 'Server-only operational record. Raw user situations are never stored. Short result payloads expire after 24 hours solely for idempotent retries.';
create index recommendation_runs_expiry on public.recommendation_runs(expires_at);
create index recommendation_runs_installation on public.recommendation_runs(installation_id,created_at);

create function public.reserve_recommendation(
  p_request_id uuid,p_installation_id uuid,p_installation_token text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_user uuid:=auth.uid();v_anonymous boolean;v_policy public.usage_policies;v_count bigint;v_full boolean;
  v_existing public.usage_events;
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
  if (select count(*) from public.usage_events where installation_id=p_installation_id and event_type='recommendation'
      and status in ('reserved','completed') and created_at>now()-interval '1 minute') >= v_policy.recommendation_rate_limit_per_minute
    then raise exception 'Recommendation rate limit exceeded' using errcode='P0001'; end if;
  if (select count(*) from public.usage_events where installation_id=p_installation_id and event_type='recommendation'
      and status in ('reserved','completed') and created_at>now()-interval '1 day') >= v_policy.recommendation_rate_limit_per_day
    then raise exception 'Recommendation daily rate limit exceeded' using errcode='P0001'; end if;
  select is_anonymous into v_anonymous from auth.users where id=v_user;
  select exists(select 1 from public.entitlements where user_id=v_user and status='active' and verified_at is not null) into v_full;
  select count(*) into v_count from public.usage_events where event_type='recommendation' and status in ('reserved','completed')
    and (installation_id=p_installation_id or (v_anonymous is false and user_id=v_user));
  if not v_full and v_count >= (case when v_anonymous then v_policy.anonymous_allowance else v_policy.account_allowance end)
    then raise exception 'Recommendation allowance exhausted' using errcode='P0001'; end if;
  insert into public.usage_events(user_id,installation_id,event_type,request_id,status,metadata)
    values(v_user,p_installation_id,'recommendation',p_request_id,'reserved','{"phase":"recommendation_v1"}'::jsonb);
  return jsonb_build_object('reserved',true,'existing',false,'status','reserved');
end $$;

create function public.finish_recommendation_usage(p_request_id uuid,p_status text,p_metadata jsonb default '{}')
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if p_status not in ('completed','failed','cancelled') then raise exception 'Invalid terminal status'; end if;
  if jsonb_typeof(coalesce(p_metadata,'{}'))<>'object' then raise exception 'Invalid metadata'; end if;
  update public.usage_events set status=p_status,metadata=metadata||coalesce(p_metadata,'{}')
    where request_id=p_request_id and event_type='recommendation' and status='reserved';
  return found;
end $$;

alter table public.embedding_runs enable row level security;
alter table public.recommendation_runs enable row level security;
revoke all on public.embedding_runs,public.recommendation_runs from anon,authenticated;
grant all on public.embedding_runs,public.recommendation_runs to service_role;
revoke execute on function public.match_recommendation_candidates(extensions.vector,text,text,integer),
  public.reserve_recommendation(uuid,uuid,text),public.finish_recommendation_usage(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.match_recommendation_candidates(extensions.vector,text,text,integer),
  public.finish_recommendation_usage(uuid,text,jsonb) to service_role;
grant execute on function public.reserve_recommendation(uuid,uuid,text) to authenticated,service_role;

create trigger embedding_runs_updated before update on public.embedding_runs for each row execute function public.touch_updated_at();
create trigger recommendation_runs_updated before update on public.recommendation_runs for each row execute function public.touch_updated_at();

comment on function public.match_recommendation_candidates(extensions.vector,text,text,integer) is 'Server-only exact cosine retrieval over profile and situational vectors. No client access to semantic profiles.';
comment on function public.reserve_recommendation(uuid,uuid,text) is 'Atomically validates installation, rate limit, entitlement and allowance before any paid model call.';
