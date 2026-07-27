# Finance Reconciliation

Payment capture creates or updates:
- Payment (including `routeSettlement` / `razorpayLinkedAccountId` for new orders)
- Receipt
- Invoice
- BookingHistory
- WalletTransaction and WalletLedger when wallet contribution exists
- Notification
- FinancialLedger gateway + revenue entries

Refunds create `Refund` records and update payment status where applicable.

## Route vs platform settlement
- **`linked_account`**: expect Razorpay Route transfer to the org linked account after capture; reconcile using Razorpay transfers + local `Payment.razorpayLinkedAccountId`.
- **`platform_fallback`**: funds remain on the platform Razorpay account; ops must manually/batch payout to the org until Route onboarding completes. Fallback events are visible in structured payment logs (`razorpay_route_platform_fallback`).
- Do **not** rewrite historical payments when an org later gets a linked account — reconcile old rows as platform-settled.
