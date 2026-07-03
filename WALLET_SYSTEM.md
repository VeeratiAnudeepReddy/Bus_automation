# Wallet System

## Implemented
- `WalletTransaction` records type, amount, before/after balance, status, reference, notes, and idempotency key.
- `WalletLedger` records debit/credit balance entries.
- Existing `/wallet/add` now writes ledger-backed transactions.
- New `/wallet/recharge`, `/wallet/transactions`, and `/wallet/ledger` endpoints are available.
- Frontend pages exist for `/wallet/recharge`, `/wallet/transactions`, and `/wallet/history`.

## Remaining
- Admin adjustment approvals, transfers between users, wallet freeze/lock UI, and reconciliation exports need more workflow testing.
