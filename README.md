# Which Drake?

An iOS app built with Expo SDK 57, React Native 0.86, Expo Router, and strict TypeScript. The approved Phase 1 UI is connected to the deployed Supabase recommendation engine while preserving its compact Home input, native tabs, result layout, and white visual design.

## Run

Use Node 24 or newer. Dependencies and the lockfile are included.

```sh
npm ci
npm run web
```

The browser preview is useful for reviewing screen content. Its bottom navigation is flat and opaque; it does not simulate Liquid Glass.

```sh
npm run go
```

Expo Go requires a client compatible with SDK 57. Native tabs may show Liquid Glass in a compatible iOS 26+ host. An older client or OS cannot show that treatment; there is no JavaScript glass fallback.

## Native iOS development

The native implementation uses `NativeTabs` from `expo-router/unstable-native-tabs`, confirmed against the installed SDK's source and type definitions. It renders the system tab bar through `react-native-screens`, with SF Symbols. On iOS 26+, Apple draws the Liquid Glass tab bar; earlier supported iOS versions retain their normal system tab bar. No custom blur, glass views, background tint, or glass cards are used.

Use a development build for authoritative iOS review, including the light interface, safe areas, keyboard, share/action sheets, transitions, app icon, and splash screen. EAS profiles are included for a physical development device, simulator, internal preview, and production/TestFlight. Expo SDK 57 requires iOS 16.4+ and Xcode 26.4+; the profiles select EAS's latest supported image. See the [versioned SDK requirements](https://docs.expo.dev/versions/v57.0.0/).

After signing into your Expo account and selecting your own application identifiers in `app.json`:

```sh
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile development
npm start
```

For a Mac simulator, use `--profile development-simulator`. For TestFlight, use `--profile production`, then submit that build with EAS. Physical device signing and TestFlight need your Apple developer account. No remote builds or submissions were made during this phase.

See [Expo's native-tabs guide](https://docs.expo.dev/router/advanced/native-tabs/), the [SDK 57 native-tabs API](https://docs.expo.dev/versions/v57.0.0/sdk/router/native-tabs/), and [development-build guide](https://docs.expo.dev/develop/development-builds/introduction/).

## Implemented

- First-launch onboarding with locally persisted Spotify / Apple Music selection.
- Home with a single-line input, real authenticated recommendation request, bounded validation, calm loading state, safe retries, and user-facing failure states.
- Real canonical-song result data, personalized explanation, available artwork/provider link, account-aware save/remove, private sharing, and a clean Try Another reset.
- Saved recommendations backed by Supabase RLS, retaining the result explanation without retaining the user's private situation.
- A modular Preview placeholder.
- Settings and service selection, plus clearly labeled Usage, About, Privacy, and Terms preview content.
- White/light UI, supplied logo pixels and proportions, sampled `#005FB1` brand blue, accessible labels and states, 44-point minimum interaction targets, and scrollable small-screen layouts.

No album artwork from the UI reference is packaged in the app. Runtime artwork must come from an authorized provider source. Brand asset provenance lives in `assets/brand/sources.json`; provider vector paths include source links.

## Structure

```text
src/app/                     Router layouts, protected onboarding, native stacks
src/components/              Shared logo, buttons, screen containers, service options
src/design/                  Palette, spacing, provider vector assets
src/domain/                  Music-service and recommendation types, explicit mock fixture
src/data/                    Versioned local storage repository and validation
src/state/                   Small React context; hydration and persisted mutations
src/features/                Recommendation result and modular Preview feature
src/platform/                Native share sheet / browser share adapter
tests/                       Local persistence and malformed-storage checks
```

Input stays in memory and is sent to the authenticated Edge Function for transient processing; the application database does not intentionally persist the raw text. OpenAI calls remain server-side with `store:false`, which does not mean Zero Data Retention. Supabase supports anonymous sessions, secure installation registration, usage reservation, and preference synchronization. Account upgrade/sign-in components are prepared; external provider configuration is still required.

The pre-launch database migrations define three free recommendations, Monthly Full Access at 50 per verified monthly period, and Annual Full Access at 300 per verified annual period. They also enforce 5/minute, 20/rolling-day, replay protection, atomic final-credit handling, and daily/monthly operator cost reservations before model calls. Apple signed-transaction verification functions and the native `expo-iap` purchase/restore adapter are implemented, but Apple product/credential/notification setup and sandbox verification remain launch blockers. In-app purchases require a development build and cannot run in Expo Go.

The Supabase migrations establish RLS-protected identity, usage, entitlements, the curated canonical catalog, semantic profiles, pgvector retrieval, analysis jobs, and the production recommendation boundary. The current recommendation catalog has 461 eligible songs; MusicBrainz enriches supplied candidates only and discovery-driven imports remain paused. See [Part 2 audit](docs/catalog/curated-feature-report.md), [Part 1 report](docs/catalog/curated-lead-report.md), [Phase 2 progress](docs/phase-2-progress.md), [auth setup](docs/auth-foundation.md) and [catalog setup](server/catalog/README.md). Do not put privileged credentials in mobile environment variables.

Recommendation requests go through the authenticated server endpoint, which checks the global kill switch, installation proof, rate limits, entitlement/test access, and allowance before paid model calls. See [Phase 5 integration and owner test access](docs/phase-5-production-ui.md).

## Validation

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run export:all
```

TypeScript, lint, 63 tests, iOS/Android/web exports, and Expo Doctor's 21 checks pass. Live verification confirms 461 eligible songs, 461 profiles, 922 embeddings, and denial of client access to semantic profiles, embeddings, recommendation runs, test-access records, retrieval, and usage-completion functions. The global recommendation switch is currently enabled. The pre-launch database suite also passes free/monthly/annual boundaries, renewal/cancellation/expiration/refund/revocation behavior, replay, short-term limits, global ceilings, and a simultaneous final-credit race. See [operations](docs/PRELAUNCH_OPERATIONS.md), [security audit](SECURITY_AUDIT.md), [privacy draft](PRIVACY_POLICY.md), and [pre-launch checklist](PRELAUNCH_CHECKLIST.md).

This Windows workspace cannot run Xcode or an iOS simulator. Native tab rendering, iOS keyboard avoidance, VoiceOver/Dynamic Type, and system transitions still require device/simulator validation. Bundle exports validate the native JavaScript, not compilation or execution of an iOS binary.

The dependency audit reports 14 moderate upstream findings involving Expo's Xcode tooling and Router URL decoding, with no high/critical findings. npm's proposed automatic fixes downgrade Expo/Router and would remove the chosen native architecture; they were not applied. Recheck supported upstream fixes before release.
