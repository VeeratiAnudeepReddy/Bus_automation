# Payment Reconciliation

## Sources
- Razorpay payment state from `Payment`.
- Refund state from `Refund`.
- Wallet state from `WalletTransaction` and `WalletLedger`.
- Accounting state from `FinancialLedger`.

## Dashboard
`GET /api/finance/dashboard` returns ticket revenue, refund totals, pending payments, failed payments, wallet balance, ledger totals, and recent ledger entries.

## Notes
Real provider settlement reconciliation requires live Razorpay settlement data and production credentials.
