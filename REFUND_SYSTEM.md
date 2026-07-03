# Refund System

`POST /api/payments/:id/refund`

Supports:
- full refund
- partial refund
- gateway refund
- wallet/gateway source metadata
- finance refund records
- audit history

Gateway refunds use `RazorpayProvider.refundPayment`.
