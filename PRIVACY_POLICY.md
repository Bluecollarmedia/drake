# Which Drake? — Draft Privacy Policy

**Draft date:** September 16, 2026  
**Status:** Pre-launch draft. **LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH.**  
**Controller/operator:** [OWNER/LEGAL ENTITY REQUIRED]  
**Privacy contact:** [PRIVACY EMAIL AND POSTAL ADDRESS REQUIRED]

This policy describes the current implementation. It must be rechecked against the production binary, provider dashboards, logging plan, launch territories, and retention settings before publication.

## Information processed

### Account and authentication

Supabase Auth creates an anonymous user session on first use. If account methods are enabled and the user upgrades or signs in, Supabase may process the selected provider identifier and, depending on the method and user choice, an email address. The app presently contains architecture for Apple, Google, and email; live provider availability depends on Supabase and provider configuration.

### Installation identity

The app creates a cryptographically random installation UUID and 256-bit token. Native builds store them in iOS Keychain through Expo SecureStore using a device-only, when-unlocked accessibility setting. The server stores the UUID and a SHA-256 hash of the token, along with platform, app version, timestamps, and associated account/session IDs. The raw token is sent to Supabase only to prove possession and is not stored in the database. Browser previews use origin-scoped local storage and do not have Keychain protections.

This identifier is pseudonymous and is not claimed to be a permanent hardware identifier. The app does not intentionally use prohibited hardware fingerprinting.

### Recommendation situations

The text a user submits is transmitted over HTTPS to a Supabase Edge Function. The function normalizes it in memory, sends it to OpenAI’s embeddings and Responses APIs, and uses it to retrieve and rerank candidates. When the request returns a successful song match, the app stores the situation and safe recommendation result in the user’s private History so that result can be reopened without another paid model call. A user can delete one History entry or clear all History without deleting Saved songs. Inputs that fail or return no strong match are not added to History.

Separately, the internal recommendation-run record does not contain the raw situation. It stores a SHA-256 input hash, character count, model/token/cost metadata, selected song identifier or no-match outcome, and a short result payload for up to 24 hours for idempotent retries.

The hash is not encryption and could theoretically be tested against guessed text. It is accessible only to trusted server context under the current RLS/grant configuration.

The Edge Function code does not log raw situations, request bodies, model prompts, candidate profiles, or model responses. It logs only a generic failure category. However, Supabase automatically creates function invocation and platform logs that include request metadata; current documentation describes function invocation and log sources. The project owner must confirm the actual Supabase plan, log retention, log drains, and dashboard settings before launch. **OWNER CONFIRMATION REQUIRED.**

### OpenAI processing

OpenAI receives the situation and candidate-profile excerpts needed for the recommendation. The Responses request sets `store:false`, which prevents Responses application-state storage for that request under current documentation. The embeddings endpoint has no application-state storage. This project has **not established that Zero Data Retention or Modified Abuse Monitoring is enabled**.

OpenAI’s current official documentation says API data is not used to train models unless the customer opts in, but default abuse-monitoring logs may contain prompts and responses and may be retained for up to 30 days. `store:false` is not Zero Data Retention. The owner must verify the OpenAI project’s data-control dashboard and sharing settings before launch. See [OpenAI Data Controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).

### Recommendation History, results, and saved items

Operational recommendation records contain result data, token/cost totals, model snapshot, and internal candidate scores. Normal clients cannot read those records. Completed result payloads are cleared after their 24-hour expiration by later function invocations.

History contains the account ID, request and song IDs, submitted situation, safe returned recommendation payload, and timestamp. RLS restricts History to its owner, and ordinary clients cannot insert or modify History records. The History list emphasizes song metadata and date rather than displaying the situation; the situation is shown only after the user opens the result and expands “Your situation.”

An authenticated user may save a result. A saved item contains the user ID, canonical song ID, generated explanation, and timestamp. The current app sends `original_user_input: null` and does not opt in to retaining the situation. RLS limits saved items to their owner.

### Usage, entitlement, and purchase data

The server stores request IDs, status, installation/account references, allowance bucket, billing-period boundaries, timestamps, reserved and measured model cost, and limited operational metadata. It stores Apple product, transaction, subscription-period, renewal, status, revocation/refund, and verification metadata when purchase verification is configured. Apple-signed transactions are verified server-side and current status is requested from Apple before granting access.

Internal operator budgets, cost alerts, semantic profiles, embeddings, retrieved candidates, and test-access allowlists are service-only.

### Preferences and device/network information

The app stores music-service preference and onboarding state locally and may sync them to the account profile. Supabase receives ordinary network information needed to provide the service, which can include IP address, user agent, request time, and routing/security metadata in platform logs. The app code does not intentionally persist full IP addresses in its database.

No third-party advertising SDK, general behavioral analytics SDK, or crash-reporting SDK was found in the reviewed source. Expo and Supabase development/hosting systems may still create operational logs. If analytics or crash reporting is added, this policy and App Store disclosures must be updated before collection begins.

### Streaming services

The chosen Spotify or Apple Music preference is stored. Opening a track link transfers the user to that provider, which then processes data under its own policy. The current app does not request a user’s Spotify or Apple Music account history. Provider URLs, catalog metadata, and artwork may be stored where source and rights permit.

## Purposes

Data is used to provide authentication, installation continuity, recommendation processing, idempotent retries, saved results, preferences, subscription verification, allowance and rate-limit enforcement, fraud and abuse prevention, security monitoring, troubleshooting, cost control, account deletion, and compliance with legal/platform duties. The final lawful-basis analysis by territory is **LEGAL REVIEW REQUIRED**.

## Service providers

- **Supabase:** authentication, Postgres database, RLS, and Edge Functions. Supabase platform, auth, and function logs may apply. [Supabase Edge Function logging](https://supabase.com/docs/guides/functions/logging)
- **OpenAI:** embeddings and AI reranking/explanation. `store:false` is set for Responses; default abuse-monitoring terms may still apply. [OpenAI Data Controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)
- **Apple:** Sign in with Apple if enabled, App Store subscription purchase/status/refund systems, Apple Music links, and App Store distribution/privacy disclosures.
- **Google:** Google authentication if enabled.
- **Spotify and Apple Music:** destination links and any authorized catalog/branding integration.
- **MusicBrainz/Cover Art Archive:** catalog metadata and artwork references used during catalog preparation; provenance and usage terms require final confirmation.

The final list of processors, contracts, transfer mechanisms, and subprocessors is **OWNER CONFIRMATION AND LEGAL REVIEW REQUIRED**.

## Retention

| Data | Current/ planned retention |
|---|---|
| Raw situation in Which Drake? History | Until the user deletes that History item, clears History, or deletes the account, subject to backup/legal constraints |
| Raw situation in OpenAI abuse monitoring | Up to 30 days by default under current OpenAI documentation; actual project control not verified as ZDR |
| Recommendation result payload | 24-hour expiry; cleared opportunistically by function invocations |
| Input hash, usage event, token/cost metadata | No final production deletion schedule configured; **LEGAL REVIEW REQUIRED** |
| Saved recommendations | Until user deletes them or the account, subject to backup/legal constraints |
| Recommendation History | Until individual deletion, Clear History, or account deletion, subject to backup/legal constraints |
| Profile/account data | Until account deletion, subject to backup/legal constraints |
| Installation records and session links | No final production deletion schedule configured; links are removed or nulled on account deletion |
| Entitlement/transaction records | Currently cascade with account deletion; statutory accounting/refund retention needs **LEGAL REVIEW REQUIRED** |
| Supabase platform/auth/function logs | Depends on Supabase plan and settings; **OWNER CONFIRMATION REQUIRED** |
| Local Keychain/session/preferences | Until app/account storage is removed, subject to iOS Keychain behavior |

The absence of a final schedule for operational ledgers is a launch blocker.

## Disclosure, sale, and tracking

The reviewed code does not sell personal information, run third-party ads, or perform cross-app advertising tracking. The final “sale,” “sharing,” and “tracking” legal classifications require confirmation of business practices and provider contracts. **OWNER CONFIRMATION AND LEGAL REVIEW REQUIRED.**

## Security

Measures include HTTPS-only production configuration, server-side API keys, Keychain storage on native devices, hashed installation tokens, authenticated Edge Functions, RLS, least-privilege grants, server-authoritative usage, request replay protection, atomic cost reservations, rate limits, and global kill switches/budgets. No system is completely secure.

## Choices, access, and deletion

Users can change music service, delete saved items, delete individual History entries, clear all History, sign out, and initiate account deletion in the app. Clearing History does not clear Saved. Account deletion is designed to delete the Supabase Auth account, profile, History, saved items, and linked entitlement record; operational deidentified records may remain for security or legal purposes. Apple subscriptions must be canceled separately.

The current deletion function does not yet revoke Sign in with Apple tokens because Apple provider credentials are not configured. This is a pre-launch blocker. The owner must provide a privacy request process and identity-verification procedure at [PRIVACY EMAIL REQUIRED].

## Children

The Service is not directed to children under 13. The final minimum age, parental-consent approach, and launch-country treatment are **LEGAL REVIEW REQUIRED**.

## International processing

Providers may process data in multiple countries. Launch territories, data-transfer mechanisms, and any regional notices are **OWNER CONFIRMATION AND LEGAL REVIEW REQUIRED**.

## Changes

Material policy changes will be communicated as required by law. App Store privacy responses must be kept accurate as code and provider practices change.

## Contact

[OWNER/LEGAL ENTITY]  
[POSTAL ADDRESS]  
[PRIVACY/SUPPORT EMAIL]

## Verification references

- [OpenAI API data controls and retention](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)
- [Supabase Edge Function logging](https://supabase.com/docs/guides/functions/logging)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Apple App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [Apple account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app)
