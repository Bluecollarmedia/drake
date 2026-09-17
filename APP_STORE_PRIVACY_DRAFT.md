# Which Drake? — App Store Privacy Disclosure Draft

**Drafted:** September 16, 2026  
**Do not publish without checking the archived production binary and all provider dashboards.**

Apple requires disclosures to cover data collected by the developer **and third-party partners** across every supported platform. A privacy policy URL is required. See [Manage App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).

## Proposed answers

### Data collected: Yes

The app and its processors collect data as Apple defines collection because data is transmitted off-device and may be retained beyond the immediate request by account, operational, provider, or abuse-monitoring systems.

| Apple category / likely data type | Collected | Linked to identity | Tracking | Purpose | Basis |
|---|---|---:|---:|---|---|
| Contact Info — Email Address | If email/Apple/Google provides it | Yes | No | App functionality, account management | Supabase Auth account |
| Identifiers — User ID | Yes | Yes | No | App functionality, authentication, fraud prevention | Supabase Auth UUID |
| Identifiers — Device ID | **OWNER/APPLE INTERPRETATION REQUIRED** | Pseudonymous; may link to account | No | App functionality, fraud prevention | Random installation UUID, not hardware ID |
| Purchases — Purchase History | When subscriptions launch | Yes | No | App functionality, subscription verification | Apple transaction/product/status |
| User Content — Other User Content | Yes | Yes | No | App functionality | Successful recommendation situations are retained in private History until deletion; OpenAI default abuse monitoring may also retain content |
| Usage Data — Product Interaction | Yes | Yes/pseudonymous | No | App functionality, analytics limited to operations, fraud prevention | Request count, status, time, plan/period |
| Diagnostics — Other Diagnostic Data | Yes | Potentially | No | App functionality, security | Function status/duration, failure category, platform logs |
| Other Data | Possibly | Possibly | No | Fraud prevention/security | Hashed installation proof, situation hash, operator records |

### Data not collected by reviewed app code

- Precise or coarse location
- Contacts
- Photos or videos
- Audio data
- Health or fitness data
- Browsing history
- Search history outside recommendation text
- Advertising data
- Third-party advertising identifiers

**OWNER CONFIRMATION REQUIRED:** Confirm Expo/Supabase/Apple SDK privacy manifests and the final Xcode archive privacy report do not add categories.

### Tracking

Proposed answer: **No**, based on no advertising SDK, no cross-company ad profiling, and no device advertising identifier in the reviewed code. **LEGAL REVIEW REQUIRED** against Apple’s definition and all final SDK/provider uses.

### Data used for advertising

Proposed answer: **No. OWNER CONFIRMATION REQUIRED.**

### Data linked to the user

Account ID, email/provider identity, History, saved items, usage, and purchases are linked. Installation identity may become linked after account upgrade. Successful-match situations are linked to the account through private History. Provider retention still requires final legal and dashboard review.

## Required production actions

1. Host the final reviewed Privacy Policy at a public HTTPS URL.
2. Add the privacy policy URL in App Store Connect and an accessible link inside the app.
3. Generate an Xcode privacy report from the release archive and compare every SDK manifest.
4. Confirm Supabase and OpenAI logging/retention and whether provider IP/network metadata changes any answer.
5. Update answers whenever an SDK, analytics, crash-reporting, auth, payment, or data practice changes.
6. Provide a privacy choices/deletion URL if the owner adopts one.

## Account deletion

The app has an in-app delete action, but Sign in with Apple token revocation is not configured. Apple requires apps with account creation, including automatically created guest accounts, to let users initiate deletion in-app. Subscription billing must be explained and managed separately. See [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app).

**Launch status:** not ready to submit this disclosure. Owner and legal confirmations remain open.
