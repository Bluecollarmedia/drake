import { mkdir, writeFile } from 'node:fs/promises';
import { connectDatabase } from './lib/database.mjs';
import { ANALYSIS_VERSION, CALIBRATION_TITLES } from '../server/analysis/song-intelligence.mjs';

const pricing = {
  model: 'gpt-5.4-mini',
  inputPerMillion: 0.75,
  cachedInputPerMillion: 0.075,
  outputPerMillion: 4.5,
};

const client = await connectDatabase();
try {
  const { rows: profiles } = await client.query(`
    select s.title,p.core_meaning,p.detailed_interpretation,p.central_conflict,p.perspective,
      p.primary_themes,p.secondary_themes,p.emotional_tone,p.energy_tone,p.emotional_intensity,
      p.emotional_dimensions,p.narrator_state,p.other_person_state,p.relationship,p.narrative,p.context,
      p.nuances,p.strong_fit_scenarios,p.moderate_fit_scenarios,p.negative_fit_scenarios,
      p.analysis_confidence,p.analysis_model,p.review_status,p.uncertainties,p.analyzed_at,p.generation_metadata,
      (select jsonb_agg(jsonb_build_object('text',ss.scenario_text,'variation',ss.variation) order by ss.created_at)
       from public.song_scenarios ss where ss.profile_id=p.id and ss.scenario_type='matching_language') example_inputs,
      (select count(*)::int from public.song_scenarios ss where ss.profile_id=p.id) scenario_count,
      (select count(*)::int from public.song_analysis_sources src where src.profile_id=p.id) source_count,
      j.status job_status,j.attempt_count
    from public.song_analysis_profiles p
    join public.songs s on s.id=p.song_id
    join public.analysis_jobs j on j.song_id=p.song_id and j.job_type='profile' and j.analysis_version=p.analysis_version
    where p.analysis_version=$1 and s.title=any($2)
  `, [ANALYSIS_VERSION, CALIBRATION_TITLES]);

  const order = new Map(CALIBRATION_TITLES.map((title, index) => [title, index]));
  profiles.sort((a, b) => order.get(a.title) - order.get(b.title));

  const usage = profiles.reduce((total, profile) => {
    const item = profile.generation_metadata?.usage ?? {};
    total.inputTokens += Number(item.input_tokens ?? 0);
    total.cachedInputTokens += Number(item.input_tokens_details?.cached_tokens ?? 0);
    total.outputTokens += Number(item.output_tokens ?? 0);
    total.reasoningTokens += Number(item.output_tokens_details?.reasoning_tokens ?? 0);
    total.totalTokens += Number(item.total_tokens ?? 0);
    return total;
  }, { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0, totalTokens: 0 });
  const uncachedInputTokens = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  const exactCostUsd = (
    uncachedInputTokens * pricing.inputPerMillion
    + usage.cachedInputTokens * pricing.cachedInputPerMillion
    + usage.outputTokens * pricing.outputPerMillion
  ) / 1_000_000;

  const { rows: [counts] } = await client.query(`
    select
      (select count(*)::int from public.released_catalog_eligible_songs) eligible_songs,
      (select count(*)::int from public.song_analysis_profiles where analysis_version=$1) analyzed_current_version,
      (select count(*)::int from public.released_catalog_eligible_songs e where not exists (
        select 1 from public.song_analysis_profiles p where p.song_id=e.id and p.analysis_version=$1
      )) awaiting_analysis,
      (select count(*)::int from public.song_embeddings) embeddings,
      (select count(*)::int from public.analysis_jobs where analysis_version=$1 and status='completed') completed_jobs
  `, [ANALYSIS_VERSION]);

  const report = {
    generatedAt: new Date().toISOString(),
    analysisVersion: ANALYSIS_VERSION,
    pricing,
    usage: { ...usage, estimatedCostUsd: Number(exactCostUsd.toFixed(6)) },
    counts,
    profiles,
  };
  const destination = new URL('../artifacts/song-intelligence/calibration-report.json', import.meta.url);
  await mkdir(new URL('../artifacts/song-intelligence/', import.meta.url), { recursive: true });
  await writeFile(destination, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await client.end();
}
