# Payment Architecture

## Implemented
- `Payment` stores Razorpay order/payment state, amount, currency, booking link, status, idempotency key, metadata, and **Route settlement mode**.
- `Payment.routeSettlement`:
  - `linked_account` — order created with Razorpay Route `transfers[]` to the org's linked account
  - `platform_fallback` — no active org linked account; funds settle on the platform Razorpay account (payments are never blocked)
- `Payment.razorpayLinkedAccountId` stores the linked account id used for that order when routed
- `Organization.razorpayRoute` holds `{ linkedAccountId, status, onboardedAt, notes }` (`none|pending|active|suspended`)
- `PaymentWebhook` stores webhook payloads, signatures, verification status, and processing timestamps.
- `POST /api/payments/create-order` creates an idempotent local order record (and Razorpay order when gateway amount > 0).
- `POST /api/payments/verify` validates `razorpay_order_id|razorpay_payment_id` with HMAC SHA-256 and finalizes capture.
- `POST /api/payments/webhook` records webhook payloads and verifies signatures when secrets are configured.
- `POST /api/payments/:id/refund` marks payment refund state and creates a `Refund`.
- Org managers can bind a Route linked account via `PATCH /api/organizations/:id` body `razorpayRoute`.

## Razorpay Route (per-organization payouts)
1. Prefer org `razorpayRoute.linkedAccountId` when `status === 'active'`.
2. Create Razorpay order with `transfers: [{ account, amount, currency, on_hold: false }]`.
3. If the org has no active linked account, **fall back to the platform account** and emit structured log `razorpay_route_platform_fallback` (organizationId, slug, routeStatus, reason).
4. **Going forward only** — existing `Payment` rows are not remapped to Route accounts.

## Configuration
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — platform account (also used for fallback).
- `RAZORPAY_WEBHOOK_SECRET` — webhook verification.
- `RAZORPAY_MODE=test|live`

## Production Notes
- Live linked-account onboarding (Razorpay dashboard/API KYC) is required per org before `routeSettlement=linked_account`.
- Past-payment migration onto Route is **not** implemented; flag as a separate decision if needed.
