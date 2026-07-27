# Booking Lifecycle

## States
`draft`, `seat_hold`, `payment_pending`, `payment_authorized`, `payment_captured`, `ticket_generated`, `completed`, `cancelled`, `expired`, `refunded`.

## Flow
1. Booking request creates a `BookingTransaction`.
2. Named seats create active `SeatLock` records.
3. Gateway bookings create `HELD` tickets until payment capture.
4. Wallet bookings create `ACTIVE` tickets immediately after wallet debit.
5. Capture marks tickets active and locks captured.
6. Failure or timeout releases locks and cancels or expires held tickets.

## Recovery
`GET /api/bookings/:id/recover` returns booking lifecycle, lock state, payment status, document numbers, tickets, and history.
