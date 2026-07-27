# Booking Engine

## Implemented
- New `/bookings` API supports route booking, comma-separated seats from UI, passenger type, coupon code, dynamic pricing, invoices, receipts, wallet debit, and booking history.
- Existing `/tickets/book` remains backward compatible and now writes booking IDs, pricing metadata, invoice, receipt, and wallet ledger entries.
- `/bookings/:id/cancel` cancels active booking tickets and creates a wallet refund.
- `/refunds` lists refund records.
- Ticket QR payload includes expiry metadata and encrypted marker.

## Remaining
- Seat map UI, hold timeout UI, partial ticket cancellation UI, and full offline QR cryptographic validation still need deeper product work.
