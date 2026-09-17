# Phase 1 QA

## Scope and reference comparison

Both supplied images were inspected. The original logo was cropped to its visible bounds without regenerating it. The blue was sampled from its pixels. The UI retains the reference's centered mark/headlines, white background, pale panels, rounded artwork, near-black provider button, outlined result actions, and restrained density.

Explicit written requirements account for the differences in onboarding wording and uppercase explanation heading. After the user's UI review, Home was updated to the reference's compact single-line field, inline blue arrow, supporting copy, and six short example chips. Saved now also uses the reference's music-note icon in the browser preview; native tabs already used the SF Symbol. The tab bar deliberately follows Apple's native Liquid Glass behavior rather than copying the static mockup's bar. No portraits or decorative imagery were introduced beyond the album artwork already in the reference.

## Automated checks

| Check | Result |
| --- | --- |
| Strict TypeScript | Passed |
| Expo ESLint | Passed |
| Local storage tests | 4 passed |
| Expo Doctor | 21/21 passed |
| iOS Hermes bundle export | Passed |
| Android Hermes bundle export | Passed |
| Web static export | Passed |

The persistence tests cover a fresh install, corrupt JSON, invalid services and malformed favorites, preference changes surviving reload, and storage failures propagating to the caller.

## Browser interaction and visual review

- First launch displayed onboarding with Continue disabled until selection.
- Spotify selection opened Home; the result showed Play on Spotify.
- Example selection filled the input and enabled Find My Song.
- The original multiline input was replaced after review. The compact field accepts long situations on one line, disables submission when empty, and opens the result through the inline arrow without sending entered text anywhere.
- Save changed the action state and populated Saved. Remove returned Saved to its empty state.
- Apple Music selected in Settings remained selected after reload. The result then showed Play on Apple Music.
- Home, Saved, Preview, and Settings navigation was exercised, including nested service settings.
- Share completed its browser host interaction and reset its busy state; no recipient was selected or message sent.
- Result button proportions were corrected after small-screen visual inspection. Standard widths show one action row; the narrow 320-point layout moves Try Another to a full-width second row.
- Browser accessibility states were corrected to announce the selected provider and tab.
- Result navigation uses dismiss-to-Home so a saved-result entry cannot trap Try Another on a previous result.
- Phone viewports reviewed: 320×568, 375×667, 390×844, 430×932. All screens scroll as needed; the navigation remains separate from scrolling content.

The browser tab bar is intentionally an opaque web preview. It cannot validate Apple's native material or iOS layout mechanics. Standard iOS SF Symbols are used in the native tab implementation; SVGs are only the non-iOS preview fallback.

## Remaining native review

These checks need a native iOS development build on a device or Mac simulator. They were not performed on Windows:

1. iOS 26+ Liquid Glass tab bar and normal system fallback on earlier supported iOS.
2. Status-bar and home-indicator insets, especially the first ScrollView inside nested native stacks. NativeTabs owns automatic iOS content insets, with no second hard-coded bottom tab-bar allowance.
3. Keyboard avoidance, single-line editing and horizontal scrolling, interactive dismissal, and the submit arrow with the software keyboard visible.
4. Tab retention, swipe-back, repeated result entry from Saved, and system transitions.
5. VoiceOver order and announcements, accessibility text sizes, reduced motion, and a device whose system appearance is dark while this app stays light.
6. Native share/action sheets and installed/uninstalled Spotify/Apple Music link handling.
7. Native app icon and splash screen; Expo Go does not fully represent application-owned launch branding.

EAS profiles are configured but no iOS binary has been built, signed, installed, or submitted. The artwork and Privacy/Terms production content remain release placeholders, as intended for this phase.
