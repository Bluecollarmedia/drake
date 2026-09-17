-- Phase 3 full-catalog run accounting. Additive only; the seven calibration profiles remain unchanged.
create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  scope text not null check(scope in ('full_released_catalog')),
  analysis_version text not null,
  model text not null,
  status text not null default 'prepared' check(status in ('prepared','running','paused','stopped_budget','stopped_failures','stopped_systemic','completed')),
  spending_ceiling_usd numeric(12,6) not null check(spending_ceiling_usd > 0),
  estimated_cost_usd numeric(12,6) not null default 0 check(estimated_cost_usd >= 0),
  reserved_cost_usd numeric(12,6) not null default 0 check(reserved_cost_usd >= 0),
  input_tokens bigint not null default 0 check(input_tokens >= 0),
  cached_input_tokens bigint not null default 0 check(cached_input_tokens >= 0),
  output_tokens bigint not null default 0 check(output_tokens >= 0),
  reasoning_tokens bigint not null default 0 check(reasoning_tokens >= 0),
  completed_count integer not null default 0 check(completed_count >= 0),
  failed_attempt_count integer not null default 0 check(failed_attempt_count >= 0),
  deferred_count integer not null default 0 check(deferred_count >= 0),
  needs_review_count integer not null default 0 check(needs_review_count >= 0),
  concurrency integer not null check(concurrency between 1 and 4),
  checkpoint_size integer not null check(checkpoint_size between 1 and 100),
  max_failures integer not null check(max_failures between 1 and 100),
  request_cost_reservation_usd numeric(12,6) not null check(request_cost_reservation_usd > 0),
  settings jsonb not null default '{}' check(jsonb_typeof(settings)='object'),
  last_checkpoint jsonb not null default '{}' check(jsonb_typeof(last_checkpoint)='object'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scope,analysis_version)
);

alter table public.song_analysis_profiles
  add column analysis_run_id uuid references public.analysis_runs(id),
  add column quality_assessment jsonb not null default '{}' check(jsonb_typeof(quality_assessment)='object');

alter table public.analysis_jobs
  add column analysis_run_id uuid references public.analysis_runs(id),
  add column input_tokens bigint not null default 0 check(input_tokens >= 0),
  add column cached_input_tokens bigint not null default 0 check(cached_input_tokens >= 0),
  add column output_tokens bigint not null default 0 check(output_tokens >= 0),
  add column reasoning_tokens bigint not null default 0 check(reasoning_tokens >= 0),
  add column estimated_cost_usd numeric(12,6) not null default 0 check(estimated_cost_usd >= 0),
  add column model_snapshot text,
  add column last_response_id text;

alter table public.analysis_runs enable row level security;
revoke all on public.analysis_runs from anon,authenticated;
grant all on public.analysis_runs to service_role;

comment on table public.analysis_runs is 'Server-only checkpoints, token accounting, and run-level cost/failure controls for resumable analysis.';
comment on column public.analysis_runs.reserved_cost_usd is 'Conservative budget held for in-flight requests. It is preserved after an abrupt worker exit.';
