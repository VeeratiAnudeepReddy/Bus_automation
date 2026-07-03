# Webhook Processing

## Overview
Razorpay webhooks are verified with the configured webhook secret and stored for idempotent processing.

## Events
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `refund.processed`
- `refund.failed`
- `dispute.created`
- `dispute.closed`

## Behavior
Invalid signatures are recorded with processing errors. Valid webhooks update payment, refund, booking, ticket, and lock state where applicable.
