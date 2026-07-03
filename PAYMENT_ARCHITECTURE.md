# Payment Architecture

## Implemented
- `Payment` stores Razorpay order/payment state, amount, currency, booking link, status, idempotency key, and metadata.
- `PaymentWebhook` stores webhook payloads, signatures, verification status, and processing timestamps.
- `POST /api/payments/create-order` creates an idempotent local order record.
- `POST /api/payments/verify` validates `razorpay_order_id|razorpay_payment_id` with HMAC SHA-256 and credits the wallet.
- `POST /api/payments/webhook` records webhook payloads and verifies signatures when secrets are configured.
- `POST /api/payments/:id/refund` marks payment refund state and creates a `Refund`.

## Configuration
- `RAZORPAY_KEY_SECRET` is required for payment verification.
- `RAZORPAY_WEBHOOK_SECRET` is required for production webhook verification.

## Production Notes
- Current code creates local order records. Live Razorpay order creation/checkout SDK wiring still needs provider credentials and runtime testing.
