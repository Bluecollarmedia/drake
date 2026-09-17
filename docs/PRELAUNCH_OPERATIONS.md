# Pre-launch Operations

## Products

| Plan | Proposed product ID | Price | Allowance |
|---|---|---:|---:|
| Monthly Full Access | `com.whichdrake.app.fullaccess.monthly` | $1.99/month | 50 per Apple subscription month |
| Annual Full Access | `com.whichdrake.app.fullaccess.annual` | $9.99/year | 300 per Apple subscription year |

The IDs and prices are pending owner confirmation in App Store Connect. The database never trusts price or entitlement state supplied by the app.

## When usage counts

The server atomically creates a `reserved` usage row before any paid model call. A successful match or no-strong-match outcome becomes `completed` and consumes one recommendation. An internal failure becomes `failed` and does not consume the customer's allowance. Any actual API cost already incurred is still committed to the operator budget. A retry with the same request ID is idempotent and does not create another charge; a genuine new request uses a new ID.

## Limits

- Free: 3 total across the linked installation/account records available to the service.
- Monthly: 50 within the Apple-verified period.
- Annual: 300 within the Apple-verified year.
- All plans/test users: 5 in one minute and 20 in a rolling 24 hours.

Reinstall/account-cycle protection is intentionally privacy-limited. Installation tokens are random, stored in SecureStore where supported, and only their SHA-256 hashes are stored by the server. They are not hardware identifiers. Global budgets cap residual denial-of-wallet risk.

## Operator controls

`public.usage_policies` is service/admin controlled. It contains the kill switch, daily/monthly ceilings, warning ratio, conservative per-request reservation, and reservation expiry. The migration installs $5/day, $50/calendar month, 80% warning, and $0.10/request reservation as conservative **placeholders**. The owner must choose production values based on acceptable risk and fund level. These controls never ship as trusted client values.

## Apple server configuration

The following are Supabase Edge Function secrets, never Expo variables:

- `APPLE_BUNDLE_ID`
- `APPLE_APP_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_PRIVATE_KEY_BASE64`
- `APPLE_ROOT_CA_BASE64_JSON`

`apple-subscriptions` is deployed for authenticated device sync and `apple-notifications` is deployed for Apple server notifications. The native client uses `expo-iap`, supplies the Supabase user UUID as Apple's `appAccountToken`, sends the signed transaction to the server, and finishes the StoreKit transaction only after the server verifies and saves current Apple status. Configure the secrets and notification URL in App Store Connect, then set `EXPO_PUBLIC_APPLE_PURCHASES_ENABLED=true` only for a native build. Both paths must be exercised in Sandbox before launch; Expo Go cannot load the native purchase module.

## Operational response

- Kill switch: set `recommendations_enabled=false`; clients receive generic temporary unavailability.
- Global ceiling: new paid calls stop; completed work remains committed.
- Warning events: poll/forward `operator_alert_events` to an owner-operated alert channel before launch.
- Key incident: disable recommendations, rotate the affected key, redeploy secret, then smoke-test.
- Expired reservation/result cleanup: install a scheduled job before launch rather than relying on request-triggered recovery alone.
