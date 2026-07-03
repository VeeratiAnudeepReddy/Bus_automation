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

## Standard Checkout
1. Server creates Razorpay order.
2. Frontend loads `https://checkout.razorpay.com/v1/checkout.js`.
3. Frontend opens checkout with order id and public key id.
4. Frontend sends payment id, order id, and signature to backend.
5. Backend verifies HMAC before marking payment captured.
