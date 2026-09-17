# Account foundation

The approved onboarding, compact Home field, mock result, Saved/Preview styling, WD? assets, local music preference and native Liquid Glass tabs remain. Account is one Settings row and a reusable root modal, not a launch wall.

## Implemented

- Anonymous Supabase session bootstrap, stored session reuse, native foreground refresh, scoped sign-out and retry. Backend connection failures do not block the mocked Home experience.
- Native installation proof is a secure random UUID plus 32-byte random token, persisted in Expo SecureStore / iOS Keychain (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`). Async Expo Crypto entropy has no development Math.random fallback. Secure read/corruption failures never silently generate another allowance identity.
- Auth session storage uses small Keychain chunks and a serialized manifest switch, avoiding large single-value Keychain failures. Browser preview uses same-origin localStorage and does not claim native security/persistence guarantees.
- Server registration checks the token hash and associates each Auth session with an installation. A verified permanent session updates the account association; usage events remain keyed to their original installation.
- Native Apple authentication is first-class, using Apple's official native button, state, hashed nonce, ID token and Supabase `linkIdentity` ID-token overload for anonymous upgrade. It requests email only, not name. Existing-account sign-in is separate; identity conflicts are not silently merged.
- Google uses PKCE and Expo's system authentication browser. Native callbacks use `whichdrake://auth/callback`; web callbacks use the current browser origin `/auth/callback`. Callback origin/path validation and deduplication protect the exchange.
- Email upgrade uses `updateUser({email})` then `verifyOtp(type: email_change)`; existing-account login uses `signInWithOtp(shouldCreateUser: false)` then `verifyOtp(type: email)`. No email was sent during automated tests.
- Account modal supports `reason=save`, `reason=allowance` and intentional Settings access. Anonymous new saves open “Keep your Drakes.” Existing Phase 1 local favorites can still be removed. Mocked Find My Song does not consume usage or require signup.
- Catalog-backed save/list APIs use RLS and verified accounts; save input deliberately excludes original situation text. The existing Phase 1 mock song remains a local fixture, never inserted as a fabricated canonical song. Cross-device mock saving is not claimed.
- Usage screen queries the read-only server-owned status. No client counter grants usage and no paid processing endpoint exists.

## Verified scope

Anonymous Auth, hosted manual linking prerequisite, browser installation registration/music-preference sync, storage/error/concurrency behavior and live transactional RLS tests passed. Anonymous-to-permanent installation association/usage preservation is verified as a database architecture test using rolled-back Auth fixtures; **this is not a real Apple/Google/email authentication test**.

## Required external setup

No credentialed provider login is claimed until these steps are completed:

1. Supabase URL Configuration must allow `whichdrake://auth/callback` and `http://localhost:8081/auth/callback` for development. Add the actual production web origin only if one exists. Local `config.toml` does not change hosted settings; do not push the whole local Auth config into the hosted project.
2. Native Apple: enable Sign in with Apple for the real Developer App ID `com.whichdrake.app`, configure that bundle ID in Supabase's Apple Client IDs, enable the provider, and rebuild the native app. Web/Android Apple requires a Services ID, callback registration and server-side signing secret; native-only setup does not require a web OAuth signing secret.
3. Google: register OAuth credentials, configure Supabase's Google provider with its secret server-side, and register `https://ndiafbgcsrbptmjzsoeo.supabase.co/auth/v1/callback`. The app never receives a Google client secret.
4. Email: configure **Change Email Address** and **Magic Link** templates to include `{{ .Token }}`. Prepared HTML templates are in `supabase/templates/`. After hosted templates/redirects are configured, set `EXPO_PUBLIC_EMAIL_OTP_READY=true` in `.env.local` and restart Expo. This is a UI readiness flag, not an authorization/allowance gate. Production delivery requires an owned SMTP setup; Supabase's default delivery has testing limits.

Unavailable methods are disabled in the account UI. Anonymous browsing stays available. These provider/dashboard dependencies are identified rather than filled with invented credentials.

Real iOS Keychain restart/update/reinstall behavior, Apple login, keyboard/accessibility and native transitions require an actual development build. Keychain survival across reinstall is not guaranteed; browser clearing and Android uninstall differ. There is no permanent hardware identifier. Installation tokens are only one signal; future atomic allowance reservation, rate limits, entitlement verification and proportionate server-side abuse checks must precede any AI call.

References: [Expo 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/), [Expo 57 Crypto](https://docs.expo.dev/versions/v57.0.0/sdk/crypto/), [Supabase anonymous upgrades](https://supabase.com/docs/guides/auth/auth-anonymous), [identity linking](https://supabase.com/docs/reference/javascript/auth-linkidentity), [native Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Expo social auth](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth).
