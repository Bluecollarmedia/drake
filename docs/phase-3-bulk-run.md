# Phase 3 full-catalog analysis

The prepared run uses `gpt-5.4-mini` and analysis version `wd-song-intelligence-v1`. The seven approved calibration profiles already use that version, so the worker skips them.

Preparation is non-billable and idempotent:

```powershell
npm run analysis:prepare
```

The bulk worker cannot start without both `--start` (provided by the package script) and an explicit spending ceiling:

```powershell
npm run analysis:full -- --spending-ceiling-usd=4
```

Optional controls:

```text
--concurrency=2
--checkpoint-size=25
--max-failures=5
```

Concurrency is restricted to 1–4. Every request reserves $0.04 before it is scheduled, and responses are capped at 4,000 output tokens. The worker stops scheduling when accumulated cost plus in-flight reservations would exceed the ceiling. Completed profiles remain committed.

Each song has at most three attempts. Failed songs remain independently retryable. Authentication, billing, and rate-limit failures stop scheduling and are deferred without consuming a song attempt. Five ordinary failed attempts stop the run by default.

Progress is written after every concurrent group to both `analysis_runs.last_checkpoint` in Supabase and the ignored local file `artifacts/song-intelligence/full-catalog-progress.json`. Per-song token counts, estimated cost, response ID, and model snapshot are stored on `analysis_jobs`; successful-profile usage is also stored in `song_analysis_profiles.generation_metadata`.

The API key is loaded only from `OPENAI_API_KEY` or `.secrets/analysis.local.json`. It is never included in progress files, database metadata, or client code.
