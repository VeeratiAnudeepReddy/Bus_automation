# Receipt System

## Overview
Receipts are created when money is successfully collected.

## Access
- `GET /api/bookings/:id/receipt`
- `GET /api/bookings/:id/receipt?format=html`

## Fields
Receipt number, booking, payment, user, amount, method, status, Razorpay payment ID, fare breakdown, and printable HTML.
