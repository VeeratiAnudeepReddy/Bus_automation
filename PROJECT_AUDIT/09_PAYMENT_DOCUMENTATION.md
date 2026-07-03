# 09 Payment Documentation

## Overview
Real payments are NOT IMPLEMENTED. The only implemented payment-like behavior is a test wallet top-up endpoint that increments balance.

## Detailed explanation
Implemented:
- Wallet balance stored on `User.balance`.
- `/wallet` page lets users enter an amount.
- `POST /api/wallet/add` increments balance.
- Backend rejects non-positive amounts and amounts over `50000`.
- Activity history for recharge is stored in browser `localStorage`.

NOT IMPLEMENTED:
- Razorpay orders.
- Razorpay checkout.
- Razorpay webhook.
- Signature verification.
- PaymentTransaction model.
- Refunds.
- Stripe.
- Cash workflow.
- Invoices/GST.
- Organization payout/sub-account flow.

Security/business limitation:
Anyone with a valid user record can call `/api/wallet/add` and add test balance. This is not real money movement.

## Code references
`frontend/app/wallet/page.tsx`, `frontend/lib/api.ts`, `backend/routes/walletRoutes.js`, `backend/controllers/walletController.js`, `backend/models/User.js`.

## File references
`12_Razorpay_Module.md`, `18_Implementation_Checklist.md`.

## API references
`POST /api/wallet/add`.

## Screens
`/wallet`.

## Dependencies
No payment SDK dependency exists.

## Current status
Development wallet only. Production payments NOT IMPLEMENTED.

## Recommendations
Do not launch paid usage until Razorpay/Stripe order creation, webhook verification, idempotency, and audit logs are implemented.
