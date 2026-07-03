# Refund Workflow

## Flow
1. A refund request is created from booking cancellation or payment refund API.
2. Wallet refunds credit the wallet and create wallet ledger rows.
3. Gateway refunds call Razorpay through the provider abstraction.
4. Refund completion records a financial ledger debit.
5. Full refunds mark active or held tickets as `REFUNDED`.
6. Booking lifecycle transitions to `refunded`.

## Statuses
`requested`, `approved`, `processing`, `completed`, `processed`, `rejected`, `failed`.
