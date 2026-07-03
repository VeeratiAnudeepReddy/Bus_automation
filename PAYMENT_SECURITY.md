# Payment Security

- Booking confirmation now depends on backend payment verification, not frontend checkout success.
- Gateway bookings keep tickets in `HELD` state until payment capture.
- Seat locks expire through the booking integrity cleanup job.
- Payment status history records lifecycle movement for auditability.
- Financial ledger rows use idempotency keys to prevent duplicate accounting entries.
- Never expose `RAZORPAY_KEY_SECRET`.
- Never expose `RAZORPAY_WEBHOOK_SECRET`.
- Frontend success is never trusted.
- Backend HMAC verification is required before local capture.
- Invalid signatures mark payments failed and create security/audit logs.
- Webhooks are verified before processing.
- Duplicate webhook processing is prevented with event ids.
