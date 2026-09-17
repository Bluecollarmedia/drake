# Phase 2 progress

Phase 2 is **in progress**, not complete. The approved Phase 1 screens and native tabs have not been redesigned.

## Applied and verified

- Public Expo configuration is in ignored `.env.local`; `.env.example` contains blank client configuration.
- CLI login and linkage to development project `ndiafbgcsrbptmjzsoeo` verified.
- Database password is in ignored `.secrets/supabase.local.json`; never passed as a visible command argument or imported by mobile code.
- Server-only Postgres tooling verifies TLS certificate and hostname using the public Supabase CA certificate.
- Anonymous Supabase sign-in verified with one local test session; its tokens are excluded from Git.
- Seven migrations (`20260915000100` through `20260915000700`) applied successfully.
- All 31 application tables enable RLS. Catalog, curated membership, analysis, usage, installation internals and entitlement writes are restricted to trusted processes; personal profile fields and permanent-user saves have scoped policies.
- `node scripts/verify-database.mjs` passed transactional security, installation idempotency/token proof, usage preservation and job lease tests. All fixtures rolled back.
- Canonical song/release/appearance and many-to-many artist tables are populated from the user-supplied Part 1 lead/joint-primary master list: 406 preserved entries, 403 canonical candidates, 333 source release editions and 2,770 appearances. MusicBrainz external IDs enrich listed candidates; no discovery-driven extra songs were added.
- Exact supplied Role/Credit fields and source factual credits remain separate. 389 candidates have matched metadata; 382 are eligible catalog candidates and 21 held, including all six explicit Review entries. All discrepancies and proposed attachments are retained for manual review.
- The real import was repeated: zero new songs/releases, stable catalog counts and all 403 internal UUIDs unchanged. Live tests verify RLS denial, the Review approval constraint and exclusion of an unlisted official-release fixture. All fixtures rolled back.
- Detailed semantic profiles, scenarios including negative fits, confusion relationships, review provenance and versioned human edits are schema only.
- pgvector enabled. Model registry is empty, dimensions have not been guessed, embedding column is unbounded with approved-model dimension validation. No embedding or AI API called.
- Analysis queue has atomic single-job claims, expiring leases, attempt limits and lease-token checked completion. No analyzer has run.
- Server-owned usage status remains read-only; recommendation processing is disabled. A future trusted endpoint must atomically reserve allowance and perform rate/abuse checks before any paid processing.
- Saved recommendation original input defaults to NULL and requires explicit opt-in for retention.

## Current external configuration blocker

Part 2's supplied feature/guest list is imported: 96 entries / 96 new candidates, zero true Part 1 overlaps and zero exact duplicates. 95 factual metadata matches; 75 eligible and 21 held. The repeat live import created zero songs/releases and retained all UUIDs/counts. Every Part 1 song record, membership and artist-credit row remained unchanged. Combined: 499 candidates, 457 eligible and 42 held, 931 editions and 3,416 appearances. “Never Hating” remains an ineligible review candidate, not a verified Drake performance. See [Part 2 audit, all review cases and suspected gaps](catalog/curated-feature-report.md). No Phase 3 work has started.

Anonymous sign-in and manual linking are enabled. The running app registered its installation, anonymous session and music preference successfully. Reusable account upgrade/sign-in UI and secure native storage are implemented without a launch signup wall. Apple, Google and email still need final external configuration; disabled methods are labeled unavailable. Credentialed OAuth and email delivery have not been verified. See [authentication setup and verified scope](auth-foundation.md).

Spotify credentials are no longer required for this catalog task. Curated master lists determine membership; MusicBrainz is a metadata/enrichment source. The discovery-driven MusicBrainz import entry point is paused and all useful tooling/cached responses are preserved. Four targeted full-project lookups enriched this import; no new artist-wide discovery ran.

Spotify and Apple Music adapters remain preserved for possible future metadata enrichment. They have not been credentialed or live-verified. The active curated import preserves exactly the intended song/version candidates and keeps uncertain source identities as attachment reviews rather than additional songs. See [the Part 1 catalog report and review cases](catalog/curated-lead-report.md) and [catalog tooling](../server/catalog/README.md).

Live counts are **499 canonical candidates, 0 analysis profiles, 0 scenarios, 0 embeddings and 0 analysis jobs**. TypeScript, lint, all 33 tests and all 21 Expo Doctor checks passed after Part 2. Earlier iOS/Android/web bundle exports passed. Earlier browser checks confirmed the approved compact input and mock result remain intact, and the registered installation ID persisted after reload. No UI code was edited in this catalog step. Native bundle exports do not verify execution of an iOS binary.

## Remaining Phase 2 work

Review Part 1's held candidates and factual discrepancies. Await the user's separate Part 2 feature/guest master list; do not generate it. Final auth-provider configuration, hosted callback allowlist/email templates, real account-upgrade verification and native device checks remain future work. No overall Phase 2 completion is claimed. Phase 3 is not authorized.

Native Keychain persistence must still be verified in an actual iOS development build. There is no permanent hardware identifier; Keychain behavior is not a physical-device guarantee.

## Repeatable tools

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/supabase.ps1 db push --dry-run
node --env-file=.env.local scripts/check-anonymous-auth.mjs
node --env-file=.env.local scripts/check-auth-linking.mjs
node scripts/verify-database.mjs
node scripts/verify-catalog-persistence.mjs
node scripts/verify-mobile-registration.mjs
npm run catalog:curated -- --plan-only
node scripts/verify-curated-catalog.mjs
```

The anonymous probe creates a test Auth user; do not run it unnecessarily. Database verification creates fixtures only inside a rolled-back transaction.
