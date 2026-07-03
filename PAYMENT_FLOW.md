# Payment Flow

## Order Creation
`POST /api/payments/create-order`

Input may include:
- `bookingId`
- `amount`
- `coupon`
- `walletAmount`
- `paymentMethod`

The backend computes wallet/gateway split, creates a Razorpay order when needed, stores a pending `Payment`, and returns checkout data.

## Verification
`POST /api/payments/verify`

The backend verifies:
`HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)`

Only verified payments are captured locally.

## Finalization
Successful verification creates receipt/invoice records, records wallet contribution, activates held tickets, creates notifications, and writes booking history.
