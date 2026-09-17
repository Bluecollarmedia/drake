# Which Drake? — Pre-launch Checklist

**Updated:** September 16, 2026  
`[x]` means evidenced in the current workspace or live database. It does not mean legal approval.

## Legal, privacy, and IP

- [x] Terms drafted
- [x] Privacy Policy drafted from reviewed data flows
- [x] Data inventory completed
- [x] App Store privacy draft completed
- [x] Third-party IP review completed
- [ ] Attorney review completed
- [ ] Governing law, operator legal name/address, contact, and age eligibility confirmed
- [ ] Drake/name/trademark/publicity/false-affiliation issues resolved
- [ ] WD? logo commercial rights confirmed
- [ ] Album artwork commercial-use rights resolved
- [ ] Spotify and Apple Music brand/API uses approved and current
- [ ] Public HTTPS Terms and Privacy URLs available

## Security and data handling

- [x] Security audit completed
- [x] No verified Critical findings open
- [ ] All High findings resolved
- [x] Cross-account database and deployed Data API isolation verified
- [x] OpenAI key is server-side in source architecture
- [x] Supabase service-role key is server-side in source architecture
- [x] Raw situation persistence is limited to user-private History and disclosed in the Privacy Policy/data inventory
- [ ] History retention, backup deletion, and sensitive-content treatment receive legal review
- [x] OpenAI retention wording distinguishes `store:false` from Zero Data Retention
- [ ] OpenAI project Zero Data Retention/Modified Abuse Monitoring setting confirmed (none is currently claimed)
- [ ] Supabase gateway/function/log-drain retention and redaction confirmed in dashboard
- [ ] Previously disclosed OpenAI key rotated
- [x] Hardened Edge Functions deployed and live smoke-tested
- [x] Workspace, generated Expo bundles, and Git-history secret scan passed
- [ ] Secret scan repeated against final native archives/source maps
- [ ] Scheduled expiry cleanup installed and monitored
- [ ] Incident response, key rotation, and support access procedures documented

## Accounts and subscriptions

- [x] Free allowance: 3, server-authoritative
- [x] Monthly database allowance: 50 per verified monthly period
- [x] Annual database allowance: 300 per verified annual period
- [x] Annual allowance remains a yearly pool
- [x] No lifetime plan
- [x] Client cannot grant itself an entitlement
- [x] Server Apple signed-transaction verification architecture implemented fail-closed
- [ ] App Store Connect product IDs/prices confirmed
- [ ] Apple issuer/key/private key/trust roots configured as server secrets
- [ ] App Store Server Notifications URL configured and deployed
- [x] Native StoreKit purchase/restore adapter implemented with server verification before transaction finishing
- [ ] Native StoreKit purchase/restore flow exercised in a development/TestFlight build
- [ ] Monthly purchase/renewal/cancellation/failed renewal/expiration/refund/revocation tested in Apple sandbox
- [ ] Annual purchase/renewal/cancellation/failed renewal/expiration/refund/revocation tested in Apple sandbox
- [x] In-app account-deletion server path live-tested
- [ ] Sign in with Apple token revocation implemented and tested
- [ ] Deleting an account explains that Apple subscription cancellation is separate

## Usage and operator cost controls

- [x] 5 requests/minute enforced server-side
- [x] 20 requests/rolling 24 hours enforced server-side
- [x] Usage reservation occurs atomically before model calls
- [x] Request replay is idempotent across sessions
- [x] Simultaneous final-credit requests tested
- [x] Daily and monthly operator cost reservations enforced before model calls
- [x] Warning threshold events created server-side
- [x] `recommendations_enabled` kill switch preserved and tested at database level
- [ ] Owner confirms daily/monthly ceilings and warning contacts for launch
- [ ] Monitoring/alert delivery connected to an owner-operated channel
- [ ] Live deployed model failure, timeout, and retry accounting retested after function deployment
- [ ] Remove or expire all development test-access records

## Recommendation behavior

- [x] No-strong-match structured outcome implemented
- [x] Client no-match presentation implemented
- [x] No title-specific production rules added
- [x] Structured output validation supports match/no-match
- [ ] Live tests for vague, unrelated, gibberish, contradictory, prompt-injection, weak-fit, and strong-fit inputs completed with funded API account after deployment
- [ ] Copyright-output checks performed on a representative production sample
- [ ] OpenAI project has sufficient prepaid balance and a confirmed owner-side project budget for launch

## Engineering validation

- [x] TypeScript passed
- [x] ESLint passed
- [x] Automated tests passed
- [x] Database/RLS boundary tests passed
- [x] Authentication/authorization/cross-account tests passed
- [x] Free #1/#2/#3/#4 passed
- [x] Monthly #49/#50/#51 passed
- [x] Annual #299/#300/#301 passed
- [x] 5/minute and 20/day boundaries passed
- [x] Duplicate/replay and concurrency tests passed
- [x] Global ceiling test passed
- [x] Expo Doctor final result recorded: 21/21
- [x] Web/iOS/Android export checks recorded
- [x] Generated Expo-bundle secret scan recorded
- [x] Dependency audit completed
- [ ] Compatible remediation for 14 moderate dependency advisories available/applied
- [ ] Native iOS archive/TestFlight validation completed
- [ ] Native Liquid Glass validation completed on supported iOS

## Release status

- [ ] Product is ready for paid public launch
- [x] **App Store submission NOT performed**

The next step is deployment/configuration validation, followed by legal clearance and Apple sandbox/TestFlight testing. Do not submit while any launch-blocking High item remains.
