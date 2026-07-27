# Financial Ledger

## Overview
`FinancialLedger` is the immutable finance record for production reconciliation.

## Categories
`revenue`, `gateway`, `wallet`, `refund`, `tax`, `coupon`, `driver_collection`, `conductor_collection`, `adjustment`.

## Guarantees
- Every row has an idempotency key.
- Every row has day, month, and year period fields.
- Direction is explicit: `debit` or `credit`.
- Finance dashboard exposes ledger totals and recent entries.

## Code
- `backend/models/FinancialLedger.js`
- `backend/services/financialLedgerService.js`
- `backend/controllers/reportingController.js`
