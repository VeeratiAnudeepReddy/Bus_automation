# Razorpay Integration

## Environment
Backend:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_MODE=test`

Frontend:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Only the key id may be exposed to the browser.

## Architecture
Controllers call `backend/services/paymentService.js`.

Business logic uses the provider interface. Razorpay-specific calls are isolated in `RazorpayProvider`.

### Route (marketplace-style payouts)
- Each Organization may store `razorpayRoute.linkedAccountId` (`acc_…`) with `status: active`.
- On `createOrderForPayment`, if the org is Route-ready, `RazorpayProvider.createOrder` includes a `transfers` array so captured funds settle to that linked account.
- If not Route-ready, the same platform keys create a normal order (**platform fallback**). Every fallback is logged as `razorpay_route_platform_fallback` — never silent.
- Historical payments are left unchanged; Route applies only to new orders.

## Standard Checkout
1. Server creates Razorpay order (with or without Route transfers).
2. Frontend loads `https://checkout.razorpay.com/v1/checkout.js`.
3. Frontend opens checkout with order id and public key id.
4. Frontend sends payment id, order id, and signature to backend.
5. Backend verifies HMAC before marking payment captured.

## Org onboarding (linked account)
`PATCH /api/organizations/:id` with:
```json
{
  "razorpayRoute": {
    "linkedAccountId": "acc_xxxxxxxx",
    "status": "active",
    "notes": "onboarded in Razorpay dashboard"
  }
}
```
Requires org_owner / org_admin / super_admin. Creating the linked account itself is done in Razorpay (dashboard or Linked Accounts API); this app stores the resulting `acc_` id.
