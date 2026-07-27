# Payment Transaction Engine

## Overview
Payments use the existing Razorpay provider abstraction and now track a full production lifecycle.

## Lifecycle
`created -> authorized -> captured -> refunded/partially_refunded`

Failure states include `failed`, `cancelled`, `expired`, `chargeback`, and `disputed`.

## Integrity Rules
- Every payment can carry an idempotency key.
- Successful verification records status history.
- Captures activate held tickets and capture seat locks.
- Failures release active seat locks and cancel held tickets.
- Refunds update payment status, create refund rows, and write financial ledger entries.

## Code
- `backend/models/Payment.js`
- `backend/services/paymentService.js`
- `backend/controllers/paymentController.js`
