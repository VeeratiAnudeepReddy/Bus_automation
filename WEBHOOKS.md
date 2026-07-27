# Razorpay Webhooks

Endpoint:
`POST /api/payments/webhook`

Supported events:
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `refund.created`
- `refund.processed`
- `order.paid`
- `dispute.created`

The raw request body is captured by Express JSON middleware and verified with `RAZORPAY_WEBHOOK_SECRET`.

Webhook idempotency uses Razorpay event id where present.
