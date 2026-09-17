# Which Drake? — Verified Data Inventory

**Reviewed:** September 16, 2026  
**Scope:** Current source and Supabase schema through migration `20260916001400`, recommendation/subscription/deletion Edge Functions, local storage adapters, and the native purchase adapter. Apple products and credentials are not configured yet.

| Category | Origin | Transmitted to | Stored/persisted | Access | Retention/deletion | Sensitivity and purpose |
|---|---|---|---|---|---|---|
| Raw situation | User | Supabase Edge Function; OpenAI embeddings and Responses | Stored only for successful matches in user-private `recommendation_history`; not stored in Saved, internal run rows, analytics, or console logs | Owner via RLS; service role; OpenAI processing | Until History deletion/account deletion; OpenAI default abuse monitoring may retain content up to 30 days; ZDR not verified | Potentially sensitive emotions/relationships; recommendation and user-requested History |
| Situation hash | Edge Function SHA-256 | Supabase Postgres | `recommendation_runs.input_hash` | Service role only | Run metadata currently has no hard deletion job; result payload expires after 24h | Pseudonymous but dictionary-guessable; replay/diagnostics |
| Result payload | Edge Function | Supabase; client | `recommendation_runs.result_payload` and client memory; selected saves separately | Service role; requesting client gets response | Expires after 24h and is opportunistically nulled | Generated explanation/song metadata |
| Retrieval/rerank internals | Recommendation engine | Supabase/OpenAI | Candidates, internal confidence, token/model data in `recommendation_runs` | Service role only | Final retention schedule missing | Confidential model/quality operations |
| Semantic profiles and scenarios | Phase 3 pipeline | Supabase/OpenAI during generation | Postgres | Service role only | Indefinite until administrative deletion | Proprietary recommendation intelligence; no user data |
| Embeddings | OpenAI generation; catalog profiles | Supabase pgvector | Postgres | Service role only | Until regenerated/deleted administratively | Proprietary vectors; no raw user situation embeddings persisted |
| Anonymous/auth account ID | Supabase Auth | Supabase/app | Auth tables and session storage | User session; Supabase admins | Until deletion; auth logs separate | Authentication |
| Email/provider identity | User/provider | Supabase; Apple/Google/email provider | Supabase Auth when configured | User/admin/provider | Until deletion/provider retention | Personal identifier; sign-in |
| Auth session/refresh token | Supabase | App | iOS Keychain; browser localStorage in web preview | App/user device | Sign-out/local deletion/expiry | Highly sensitive credential |
| Installation UUID/raw token | App secure randomness | Supabase registration and recommendation RPC | Raw token in native Keychain or web localStorage; UUID in DB | App; hash only in DB | No final server retention schedule | Pseudonymous security identifier |
| Installation-token hash | Server | Supabase | `installations.installation_token_hash` | Service role/RPC verification | No final retention schedule | Authentication proof |
| Platform/app version/timestamps | App | Supabase | `installations` | Service role | No final retention schedule | Operations/abuse prevention |
| Music-service preference | User | Local storage; Supabase profile | AsyncStorage and `profiles` | User account | Until changed/account deleted | Preference |
| Saved recommendation | User action | Supabase | User ID, song ID, explanation, time; raw input is null | Owner via RLS; service role | Until user/account deletion | Personal content association |
| Recommendation History | Successful recommendation | Supabase | User/request/song IDs, raw situation, safe result snapshot, time | Owner via RLS; service role | Until individual deletion, Clear History, or account deletion | Sensitive user content; reopening a result without another AI call |
| Usage event | Server | Supabase | Account/install, request UUID, status, allowance bucket/period, timestamps, reserved/actual cost, limited metadata | Service role | Final schedule missing | Billing/security operations |
| Subscription/entitlement | Apple verified server path | Apple; Supabase | Product, plan, transaction IDs, billing period, status, renewal/revocation, verification metadata | User gets limited status; service role full | Final accounting/legal schedule missing | Purchase/account data |
| Operator budget/cost alerts | Server | Supabase | Daily/monthly reserved/committed cost and alerts | Service role only | Operational schedule missing | Confidential business information |
| Test-access allowlist | Owner/admin | Supabase | User or installation ID, limits, expiry | Service role only | Until expiry/admin deletion | Security-sensitive |
| Catalog metadata | Curated lists, MusicBrainz, Cover Art Archive, provider links | Supabase/client | Artist/song/release/provider IDs, URLs, artwork references | Authenticated catalog read; service write | Administrative | Third-party IP/metadata |
| Share output | User action | OS share target selected by user | Not persisted by app | User-selected app/provider | Target’s policy | Song title, credit, explanation; excludes raw situation |
| Supabase operational logs | Requests/platform | Supabase | Function invocation, auth, gateway, database logs depending service/config | Project admins/Supabase | Plan/settings dependent; owner confirmation required | May include IP, headers allowlist, route, timing/status; code avoids raw body logs |
| OpenAI API data | Recommendation function | OpenAI | `store:false` for Responses; no embeddings application state; default abuse-monitoring may apply | OpenAI authorized personnel/systems under policy | Up to 30 days default abuse monitoring unless approved controls apply | Raw situation and profile excerpts |
| Crash/analytics data | None in reviewed app code | None configured | No third-party analytics/crash SDK found | N/A | N/A | Reassess before adding SDKs |

## Deletion map

- Deleting a saved item removes that row.
- Deleting a History item or using Clear History removes the associated raw situation and result snapshot without affecting Saved.
- Deleting an Auth account cascades its profile, History, saved items, installation-session links, and entitlement rows.
- Installation `user_id`, usage `user_id`, and recommendation-run `user_id` become null rather than deleting the operational record; this preserves abuse/accounting history without the direct account link.
- Installations themselves do not automatically delete with an account because free-allowance abuse protection depends on installation history.
- Apple subscription cancellation is separate from account deletion.
- A production retention/deletion schedule, backup behavior, and lawful exceptions remain **LEGAL REVIEW REQUIRED**.

## Data-flow verification notes

- The only `console.error` in the recommendation function emits `recommendation_failed` plus a bounded category; it does not emit the situation or provider error.
- The mobile client validates that only a Supabase publishable/anon key can initialize the client.
- Service-role, database, OpenAI, and Apple private credentials are referenced only through server environment variables or ignored local files.
- Normal clients were live-tested and denied access to installations, usage events, semantic profiles, embeddings, recommendation runs, operator budgets, test access, and the usage-completion RPC.
- Browser preview private state uses localStorage and must not be presented as having Keychain security.

## Open items

1. **OWNER CONFIRMATION REQUIRED:** Supabase plan and exact log-retention/log-drain settings.
2. **OWNER CONFIRMATION REQUIRED:** OpenAI project sharing and data-control settings; ZDR is not established.
3. **LEGAL REVIEW REQUIRED:** retention periods and lawful bases by launch territory.
4. **OWNER CONFIRMATION REQUIRED:** final authentication providers and processor agreements.
5. **OWNER CONFIRMATION REQUIRED:** production analytics/crash tooling, if any.
