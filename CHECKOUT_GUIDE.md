# Checkout Guide

## Frontend
Use `/payments/new`.

Fields:
- amount
- bookingId
- walletAmount
- couponCode
- paymentMethod

The page creates an order, loads Razorpay Checkout, opens checkout, and verifies the payment with the backend.

## Test Mode
Set:
- `RAZORPAY_MODE=test`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Then execute a real Razorpay test payment and verify webhook delivery.
