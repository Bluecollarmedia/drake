# Catalog foundation

This is trusted, server-only tooling, never a mobile import. It uses the database password from ignored `.secrets/supabase.local.json`, Supabase's CA certificate for verified TLS, and provider credentials from ignored `.secrets/catalog.local.json`. No service key, provider secret, or database password belongs in `EXPO_PUBLIC_*`.

## Active membership source: curated master lists

The supplied `curated/drake-lead-master.txt` determines Part 1 membership (406 entries / 403 candidates); `curated/drake-feature-master.txt` determines Part 2 (96 entries / 96 candidates). MusicBrainz enriches factual metadata only. Supplied primary artists, titles, credits, roles, versions and years remain separate from source facts. Combined: 499 candidates, 457 eligible, 42 held. See [Part 2 audit](../../docs/catalog/curated-feature-report.md) and [Part 1 report](../../docs/catalog/curated-lead-report.md).

```sh
npm run catalog:curated -- --plan-only
npm run catalog:curated
node scripts/verify-curated-catalog.mjs
node scripts/report-curated-master.mjs
npm run catalog:curated -- --part2 --plan-only
node scripts/import-curated-features.mjs
npm run catalog:curated -- --part2
node scripts/report-curated-features.mjs
```

`--plan-only` parses the supplied list and enriches from the existing cached metadata without database writes or artist-wide discovery. The normal command performs the transactional curated import. It is idempotent: the verified real repeat inserted zero songs/releases and preserved all 403 UUIDs. `catalog_master_lists` retains versioned master content; `catalog_master_entries` retains every supplied entry; `catalog_memberships` controls active scope and review eligibility. The eligible-catalog view requires approved active curated membership, so metadata-only/unlisted songs cannot enter it. All tables enable RLS. Do not manually approve Review entries without factual performance verification.

## Preserved MusicBrainz enrichment infrastructure

Part 2's standalone import command defaults to a rollback-only rehearsal. `--apply` or the `catalog:curated -- --part2` wrapper performs the live import. The verified repeat creates zero songs/releases and retains all 96 UUIDs and combined counts. Scoped master activation cannot deactivate Part 1. Cross-scope provider matches preserve the original canonical record and flag the new role claim; a shared title alone is never a cross-scope match. Part 2 plans, query evidence and verification reports are in ignored `artifacts/curated-features/`. The audit includes every pending proposal and a bounded list of suspected gaps that were not imported.

The former `npm run catalog:musicbrainz` discovery-driven import entry point is paused and exits before fetching/writing. `scripts/import-musicbrainz.mjs` permits historical local plan inspection only (`--plan-only`), not catalog writes. Its old counts are not authoritative. The client, discovery code, normalization, fixture tests and source snapshots remain preserved. `scripts/enrich-curated-projects.mjs` performed four targeted full-release lookups for listed projects; it did not run another artist-wide browse.

MusicBrainz reads need no account or API key. Artist MBID: `9fff2f8a-21e6-47de-a2b8-7f449929d43f`, verified as the Canadian rapper. The server-only client uses JSON, an identified User-Agent, serialized requests with at least 1.5 seconds after responses, pagination, Retry-After/backoff and timestamped disk caching. Set `MUSICBRAINZ_USER_AGENT` to the application's version and a real maintainer contact when changing ownership.

Discovery combines recording-level performing credits, release `track_artist` browsing and exact recording-ID-bounded official searches. The ID-bounded searches avoid relevance-pagination duplicates. Full cached track-credit listings and full lookups for releases absent from the index discover guest credits too. Source metadata distinguishes actual track artist credits from recording credits retained when indexed appearances omit the specific track credit. Targeted indexed appearance listings are not represented as complete release tracklists.

MusicBrainz `Official` and previously officially released `Withdrawn` entries are eligible; bootlegs, unknown status, pseudo-releases, pre-release-only promotional material, fan/AI impersonations, karaoke/tributes and continuous DJ excerpts are excluded or held for review. Instrumentals need actual Drake performance evidence. Artist-relation checks hold contradictory guest-interlude vocal credits for manual review. Writer/producer relationships alone never include a song.

Canonical songs use internal UUIDs and `catalog_type=official_released`; `unreleased` is reserved, not populated. MusicBrainz recording/release/artist/track IDs remain external identifiers. One recording ID is reused across appearances. Distinct IDs consolidate only with compatible titles/performers/versions/durations plus shared ISRC or supported clean/explicit release-family evidence. Fuzzy/conflicting cases remain separate with explicit duplicate reviews; existing UUIDs and future human analysis edits are preserved.

The current review report is `docs/catalog/curated-lead-report.md`, with a complete CSV export alongside it. Imported snapshot plans/reports and stable-UUID/security evidence are in ignored `artifacts/curated-catalog/`. Source responses and historical discovery metadata remain in ignored `artifacts/musicbrainz/`. No lyrics, embeddings, scenarios or AI profiles/jobs are generated. See [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API), [recording search fields](https://musicbrainz.org/doc/MusicBrainz_API/Search/RecordingSearch), [rate limits](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting) and [release status definitions](https://musicbrainz.org/doc/Release).

## Optional future Spotify / Apple adapters

These adapters are preserved but are not required for this curated import. Their legacy discovery/persistence entry point is paused and exits before fetching/writing. Future use must be restricted to enriching supplied candidates. Copy `credentials.example.json` to `.secrets/catalog.local.json` only when their credentialed enrichment is authorized. Historical (disabled) commands:

```sh
npm run catalog:import -- spotify US
npm run catalog:import -- apple us
```

The optional provider importer stops before network/database work when its credentials are missing. Neither Spotify nor Apple adapter is claimed live-verified without a credentialed run.

## Sources and coverage

- Spotify: [Drake's provider artist identity](https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4), verified again against the API at import time. Queries album, single, appears_on and compilation groups separately because `album_group` was removed from 2026 development-mode responses. Artist pages use the current maximum of 10; track pages use 50; full track resources provide recording identifiers. See [artist releases](https://developer.spotify.com/documentation/web-api/reference/get-an-artists-albums), [album tracks](https://developer.spotify.com/documentation/web-api/reference/get-an-albums-tracks), [track metadata](https://developer.spotify.com/documentation/web-api/reference/get-track) and [2026 changes](https://developer.spotify.com/documentation/web-api/references/changes/february-2026).
- Apple Music: [Drake's provider artist identity](https://music.apple.com/us/artist/drake/271256), verified against the API. Queries catalog artist albums, album tracks and song artist relationships. Requires an Apple developer token; no music-user token or user's library access is requested. See [resource relationships](https://developer.apple.com/documentation/applemusicapi/handling-resource-representation-and-relationships) and [catalog songs](https://developer.apple.com/documentation/applemusicapi/get-a-catalog-song).
- Other storefronts, withdrawn/unreleased material, uncredited features, music videos, and tracks not listing the configured artist are excluded. API release classifications may not distinguish mixtapes and EPs. A single-storefront API result is not an exhaustive Drake discography.
- Credit relationships are normalized into artists. Ordering can identify non-primary Drake credits, but does not alone establish a featured role. Display-name strings are not split to invent missing artists.
- No lyrics, audio, artist portraits, listening history or AI profiles are fetched. Artwork is referenced by provider URL; source links are retained for attribution.

Provider-derived metadata stays distinct from future analysis evidence. Before Phase 3, review the rights for any proposed analysis source and provider terms, including Spotify's restrictions on AI/model use. This importer performs metadata normalization only and does not ingest provider content into an AI model. See the [Spotify developer policy](https://developer.spotify.com/policy).

## Identity and idempotency

- A session-level database advisory lock prevents competing importer runs from racing. Each release transaction is committed separately; failures can be retried.
- Provider artist/release/recording IDs are unique inside their provider namespaces. Repeated imports upsert appearances by release/disc/track.
- One canonical song can have many release appearances. Different recording IDs consolidate only when ISRC, normalized title, version, complete artist set, primary credit, duration within one second, and explicit status agree.
- Missing evidence, conflicting versions, clean/explicit differences, or multiple valid candidates produce separate songs and duplicate-review pairs. No uncertain existing rows are destructively merged.
- Live/remix/edit/acoustic/demo/remaster descriptors are preserved. Metadata drift on an existing provider ID is flagged; semantic profiles and human edits are never overwritten by this importer.
- Only the explicitly configured and provider-verified Drake subject is linked across provider artist namespaces automatically. Other cross-provider artist identities require trusted mapping; name equality is not used to merge artists. Releases remain separate across editions/providers until reviewed.
- Pending analysis jobs are not automatically generated or processed. No AI analysis or embeddings run.

## Reports and checks

Each actual run records its source/market/coverage, release and appearance counts, canonical totals, credit examples, recording consolidations, review candidates, missing provider links and errors. Generated reports are in ignored `artifacts/catalog-imports/`; run history is in `catalog_imports`.

`node scripts/verify-catalog-persistence.mjs` checks real persistence SQL with synthetic fixtures, including two releases/one canonical song, repeat writes, uncertain matches and a separate live version. Every fixture rolls back. **This is not a substitute for running and repeating a real provider import**, which remains required before Phase 2 completion.
