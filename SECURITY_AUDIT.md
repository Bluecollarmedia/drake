# Which Drake? — Pre-launch Security Audit

**Assessment date:** September 16, 2026  
**Scope:** Expo client, Supabase schema/RLS/RPCs, Edge Functions, recommendation cost controls, local configuration and generated artifacts.  
**Status:** Pre-launch assessment. This is not a guarantee of security.

## Executive result

No verified Critical vulnerability remains in the reviewed code or applied database migration. The database boundary, account isolation, request replay, allowance boundaries, concurrency, short-term limits, and operator budget reservation passed adversarial tests. Public launch remains blocked by the High items below, chiefly deployment and live Apple purchase configuration/verification.

## Findings

### Critical

None verified.

### High

#### H-01 — Hardened Edge Functions deployment

- **Affected component:** production `recommend`, `apple-subscriptions`, `apple-notifications`, and `delete-account` functions.
- **Vulnerability:** the hardened functions initially existed only locally.
- **Remediation:** deployed `recommend`, `apple-subscriptions`, `apple-notifications`, and `delete-account` after restoring CLI authentication.
- **Verification:** direct live tests denied unauthenticated/forged requests, rejected an untrusted origin and short input, kept Apple verification fail-closed without configuration, rejected invalid notifications, required deletion acknowledgement, deleted a temporary account, and invalidated its session.
- **Status:** **FIXED AND LIVE-VERIFIED.** Paid Apple lifecycle verification still depends on H-02.

#### H-02 — Apple subscriptions are not configured or end-to-end verified

- **Affected component:** Full Access purchasing and entitlements.
- **Vulnerability:** the server verifier is implemented fail-closed, but App Store Connect products, Apple keys/root certificates, webhook, and the native purchase client are not configured. The purchase buttons remain disabled.
- **Attack path:** no bypass was found; the risk is shipping a paid product whose purchase, renewal, refund, expiration, or restore path has not been proven.
- **Impact:** customers could pay without receiving correct access, or retained access could diverge from Apple status.
- **Remediation:** create/confirm product IDs, configure Apple credentials as server secrets, register notifications, enable the implemented native adapter in a development build, and test sandbox lifecycle events.
- **Verification:** signed-transaction tests plus sandbox purchase, renewal, cancellation, billing retry, expiration, refund, revocation, restore, and account-transfer tests.
- **Status:** **OPEN — launch blocker.**

#### H-03 — Previously disclosed OpenAI credential must be rotated

- **Affected component:** OpenAI project credential.
- **Vulnerability:** an API key was pasted into this conversation earlier. It was not committed or placed in the client source, but it must be treated as disclosed.
- **Attack path:** anyone with access to the conversation or copied transcript could use the credential if it remains active.
- **Impact:** unauthorized API use and cost.
- **Remediation:** revoke the disclosed key, create a replacement with the narrowest practical project permissions/budget, update only the Supabase server secret, and retest.
- **Verification:** old key fails; production function succeeds with replacement; scans remain clean.
- **Status:** **OPEN — launch blocker.**

#### H-04 — Sign in with Apple token revocation is not implemented in account deletion

- **Affected component:** account deletion.
- **Vulnerability:** the deletion function removes the Supabase user but does not revoke Sign in with Apple credentials because provider configuration is absent.
- **Attack path:** a user deletes an account created through Apple; identity-provider tokens may remain valid outside the deleted application record.
- **Impact:** failure to meet Apple deletion expectations and incomplete account closure.
- **Remediation:** retain the Apple authorization code/refresh-token material only as required and securely, implement Apple token revocation, then delete the application account. Keep subscription cancellation separate and clearly explained.
- **Verification:** Apple sandbox deletion test and successful token-revocation response.
- **Status:** **OPEN — launch blocker if Apple sign-in is enabled.**

### Medium

#### M-01 — Dependency audit reports 14 moderate findings

- **Affected component:** Expo tooling/router dependency tree.
- **Attack path:** transitive vulnerable code in development/build or URI processing paths.
- **Impact:** depends on reachability; no exploit was demonstrated.
- **Remediation:** update within Expo SDK 57 compatibility as fixed versions become available. Do not apply npm's suggested incompatible Expo downgrade.
- **Verification:** `npm audit` and Expo Doctor after compatible upgrades.
- **Status:** **OPEN, accepted temporarily for pre-launch development.**

#### M-02 — Operational retention cleanup is opportunistic

- **Affected component:** `recommendation_runs` result payloads and expired reservations.
- **Vulnerability:** records carry expiry timestamps and stale reservations are recovered during reservation calls, but no verified scheduled deletion job exists.
- **Impact:** operational result data can outlive its intended 24-hour window if traffic stops.
- **Remediation:** install and monitor a scheduled cleanup job; document backup/log retention separately.
- **Status:** **OPEN.**

#### M-03 — Platform log configuration is not independently attested

- **Affected component:** Supabase gateway/Edge logs and OpenAI abuse monitoring.
- **Vulnerability:** app code does not intentionally log raw situations, but upstream request and provider retention behavior was not proven from project-level dashboard settings.
- **Impact:** privacy wording cannot state that user situations are never retained anywhere.
- **Remediation:** inspect production log-drain, gateway, function, tracing, OpenAI data-control, and support settings; establish redaction and retention procedures.
- **Status:** **OPEN; owner confirmation required.**

#### M-04 — Free-tier anti-abuse has practical limits

- **Affected component:** three-use free allowance.
- **Vulnerability:** random installation secrets in Keychain/SecureStore plus account linkage deter basic resets, but device restore, account cycling, and determined multi-device abuse cannot be perfectly prevented without more invasive signals.
- **Impact:** limited denial-of-wallet exposure, constrained by per-account/install rate limits and global budgets.
- **Remediation:** monitor aggregate abuse, require account upgrade after free use, apply privacy-conscious network signals server-side if later justified, and retain global ceilings.
- **Status:** **OPEN, documented design tradeoff.**

### Low

#### L-01 — Web preview stores session material in browser storage

- **Affected component:** Expo web testing.
- **Impact:** shared or compromised browsers can expose the test session.
- **Remediation:** do not treat the web preview as the production iOS security model; clear test sessions and prefer native SecureStore for iOS.
- **Status:** **OPEN.**

#### L-02 — Development test access must be removed or strictly expired

- **Affected component:** owner test allowlist.
- **Impact:** an accidentally persistent allowlist bypasses subscription-period allowance for that identity, although rate limits and global budgets still apply.
- **Remediation:** delete/expire all records before release and add an operational check.
- **Status:** **OPEN pre-launch task.**

### Informational

- `EXPO_PUBLIC_SUPABASE_URL` and the publishable/anon key are public client configuration; protection depends on RLS, grants, and authenticated RPC design.
- Music catalog rows exposed intentionally to authenticated clients are not treated as private customer data.
- `store:false` disables OpenAI Responses application-state storage; it does not establish Zero Data Retention.

## Verified fixes

1. **Subscription spoofing:** clients cannot write entitlements or call the service-only Apple apply function.
2. **Generic active-entitlement bypass:** only a known product with a current verified billing period grants monthly/annual allowance.
3. **Allowance races:** account/install row locking and a unique account/request constraint serialize final-credit attempts.
4. **Replay:** an account-wide request ID returns the existing reservation/result rather than consuming another credit.
5. **Rate abuse:** 5/minute and 20/rolling-24-hour limits include reserved and completed work across the account and installation.
6. **Denial of wallet:** daily/monthly operator reservations occur atomically before an OpenAI call; ceilings stop new calls.
7. **Crash undercount:** an expired reservation is conservatively committed at its reserved cost, so a process crash after a paid call cannot silently reopen operator budget; the customer credit is still released.
8. **Test bypass:** owner test access does not bypass short-term limits or operator budgets.
9. **Client data access:** semantic profiles, embeddings, runs, usage events, installations, entitlements, budgets, and test-access records are denied to ordinary clients except through narrow RPCs.
10. **CORS:** the deployed function uses an explicit web origin allowlist rather than wildcard CORS.
11. **Error leakage:** client-facing mappings do not expose SQL, prompts, model/provider errors, budgets, or stack traces.

## Live authorization evidence

Two distinct live Supabase users were created for the test and removed afterward. User B could not read or delete User A's saved item, profile, entitlement, installation, usage, or recommendation data. Neither user could access semantic profiles, embeddings, internal runs, operator budgets, test-access data, or service-only completion functions. Unauthenticated and forged-token recommendation calls returned 401. An installation secret owned by User B could not be used by User A.

The database test also proved free request 1–3/4, monthly 49/50/51, annual 299/300/301, minute 5/6, day 20/21, cross-session replay, and two simultaneous final-credit requests (exactly one succeeded).

## Threat-model limitations

- A determined person can use multiple real devices/accounts/networks. The design deliberately avoids prohibited hardware fingerprinting.
- RLS tests do not replace monitoring, incident response, secure dashboard access, key rotation, backups, or provider configuration reviews.
- Apple verification code cannot establish purchase integrity until it is deployed with real Apple trust roots and exercised in sandbox/production.
- AI prompt isolation reduces prompt-injection impact but cannot prove every future model response safe; structured schema validation and hidden candidate/profile data are still required.

## Launch decision

The database and deployed service boundary are materially stronger, but the project is **not ready for paid public launch** until the remaining High findings are closed and retested. Legal and third-party-rights issues are tracked separately.

The deployed no-strong-match probe could not exercise model behavior: all six capped requests received the endpoint's generic failure response, and a separate content-free OpenAI embedding probe returned `credit_balance_exhausted`. The server released the failed recommendation credits as designed. Fund the replacement/rotated server credential before rerunning those behavioral tests.
