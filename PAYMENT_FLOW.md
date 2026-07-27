# Payment Flow

## Hosted Checkout (browser)
1. Create booking with `paymentMethod: gateway` → seat hold / `payment_pending`
2. `POST /payments/create-order` with `bookingId`
3. Frontend loads `checkout.razorpay.com/v1/checkout.js` and calls `checkout.open()` (`frontend/lib/razorpayCheckout.ts`)
4. On success handler → `POST /payments/verify` with order/payment/signature
5. Razorpay also sends `payment.captured` webhook → `processWebhook` (idempotent finalize)
6. Tickets become `ACTIVE`; UI shows confirmation (`/bookings/:id?paid=1`)

Automated loop (signature-equivalent to Checkout success + webhook):  
`E2E_CLERK_TOKEN=… node backend/scripts/e2e-hosted-checkout-loop.js`

## Order Creation
`POST /api/payments/create-order`

Input may include:
- `bookingId`
- `amount`
- `coupon`
- `walletAmount`
- `paymentMethod`

The backend computes wallet/gateway split, creates a Razorpay order when needed, stores a pending `Payment`, and returns checkout data.

## Verification
`POST /api/payments/verify`

The backend verifies:
`HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)`

Only verified payments are captured locally.

## Finalization
Successful verification creates receipt/invoice records, records wallet contribution, activates held tickets, creates notifications, and writes booking history.

## Razorpay Route
New gateway orders resolve org `razorpayRoute`:
- active linked account → order includes Route `transfers`
- otherwise → platform account + log `razorpay_route_platform_fallback`

Create-order responses include `routeSettlement`. Past payments are not remapped.
