# 12 — Razorpay Payments Module

Built last, per the master prompt's own ordering ("implement payment only after
everything else") — also sensible practically, since it depends on Organization
(for payout routing) and Finance Manager role (for refund approval) both existing first.

## Blocking open questions (02 #11–13)
Whether each Organization needs its own Razorpay Route/sub-account (marketplace-style
split payments) vs. all payments flowing to one platform account with manual payout to
operators is a foundational decision that changes the integration shape entirely.
**Not proceeding with implementation detail until this is answered** — the two paths
are:
- **Single account**: simpler, faster to ship, platform holds funds, manual/batch payout
  to operators — reasonable for an early-stage multi-tenant product.
- **Razorpay Route (marketplace)**: each org onboards its own KYC'd sub-account, splits
  happen automatically — more "correct" long-term but real onboarding friction per org
  and Razorpay approval overhead.

Default assumption if not otherwise specified: start with single-account, design the
`PaymentTransaction` schema (05) so `organizationId` is tracked from day one, making a
later move to Route-based splits a backend-only change with no schema migration.

## Flow (assuming single-account default)
1. `POST /api/payments/orders` — server creates a Razorpay order (`amount`, `currency`,
   `receipt` = internal transaction id), returns `order_id` to client.
2. Client completes payment via Razorpay Checkout (frontend SDK).
3. `POST /api/payments/webhook` — Razorpay posts payment status here.
   **Signature verification is mandatory and non-negotiable**: `X-Razorpay-Signature`
   header checked against HMAC-SHA256 of the raw body using the webhook secret before
   any state change. No auth middleware on this route (Razorpay isn't a logged-in user)
   but signature check replaces it.
4. On verified `payment.captured`: `PaymentTransaction.status → paid`, then — reusing
   the exact transactional pattern from `bookTickets` (04) — atomically credit
   `User.balance` or mark a ticket purchase complete, keyed by `idempotencyKey` so a
   webhook retry (Razorpay retries on non-200 response) never double-credits.
5. Client-side polling or a short webhook-triggered push confirms completion in the UI.

## Refunds
`POST /api/payments/:id/refund` — `finance_manager`/`org_owner` only. Calls Razorpay
refund API, writes `AuditLog` entry, updates `PaymentTransaction.status`. Partial
refunds supported by amount parameter, validated against remaining refundable balance.

## Security
- Webhook secret and API keys in env vars, never logged, never returned in any API
  response.
- Idempotency key required on order creation to prevent duplicate orders from
  double-clicks/retries client-side.
- All money-moving code paths reviewed for the same atomic-update pattern already
  proven in `bookTickets` — no new "read balance, then write balance" race conditions
  introduced.

## Testing
Razorpay provides test-mode keys and a webhook simulator — full test plan in
14_Testing_Strategy.md includes simulated webhook replay/duplicate-delivery tests
specifically because idempotency bugs are the most common real-world Razorpay
integration failure.
