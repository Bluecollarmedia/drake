# Phase 5 production UI integration

The Home screen calls the deployed, authenticated `recommend` Edge Function. A persistent anonymous Supabase session and the Keychain-backed installation proof allow the first recommendation without an account wall. The input remains in memory, is sent only to the Edge Function and OpenAI with `store:false`, and is never written to the database. A request UUID is reused after an uncertain timeout so a retry cannot create a second paid request.

The result route now displays the returned canonical song, artist credits, release metadata, available Cover Art Archive artwork, provider links when present, and the personalized explanation. It does not invent missing artwork or streaming links. Try Another clears the result and input before returning Home. Sharing excludes the private situation and internal data. Saving requires an upgraded account and stores only the catalog song UUID and personalized explanation; it does not store the situation.

## Owner test access

`public.recommendation_test_access` is a service-only, expiring allowlist. An entry may target one user or one installation. It bypasses only the unfinished recommendation allowance. Authentication, installation proof, the global `recommendations_enabled` switch, a 30-per-minute default test limit, and a 500-per-day default test limit still apply. The mobile client cannot read or grant this access.

For a development build on an iPhone:

1. Open the app once and go to **Settings → Usage**.
2. Copy the development-only installation ID shown there.
3. From this project folder, run:

```powershell
npm run recommendation:test-access -- --installation-id=PASTE-THE-ID-HERE --days=30
```

The Usage screen will say that development test access is active after it reloads. Disable the global switch at any time with:

```powershell
npm run recommendation:switch -- --enabled=false
```

The local browser installation used for Phase 5 was granted 30 days of owner test access. A physical iPhone gets a different secure installation ID and must be allowlisted separately using the steps above.

## Real-world test notes

The production-path suite creates an anonymous Supabase session, registers a temporary installation, grants that exact installation expiring test access, calls the deployed Edge Function, records safe result data locally, and then deactivates the temporary access. The suite covered 22 distinct messy situations plus four focused reruns after confidence calibration. A browser UI submission also exercised Home → loading → real result → Try Another.

The suite exposed overconfidence for vague input. The reranker now caps confidence for vague or materially ambiguous situations and must acknowledge that ambiguity. A separate regression showed that an origin-story song could be selected from an unstated hardship; the prompt now explicitly rejects candidates whose strongest fit requires invented backstory. The attempted confirmation run for that last correction was blocked by the OpenAI account's exhausted credit balance.

The grief/loss case remains a known quality gap: none of the current Phase 3 profiles explicitly identify grief, so retrieval and reranking chose relationship-loss songs. This is a source-profile coverage issue to review later; Phase 5 did not alter Phase 3 data to force a result.
