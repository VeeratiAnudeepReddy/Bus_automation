# Invoice System

## Overview
Invoices are created for completed wallet and verified gateway bookings.

## Access
- `GET /api/bookings/:id/invoice`
- `GET /api/bookings/:id/invoice?format=html`

## Fields
Invoice number, booking, user, subtotal, tax, total, wallet contribution, Razorpay payment ID, payment method, and line items.

## Note
Printable HTML is implemented. Binary PDF rendering is not yet added.
