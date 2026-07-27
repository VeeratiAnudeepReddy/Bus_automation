# Sprint 9 Test Results

## Backend
Command:
```bash
npm test
```

Result:
```text
Test Suites: 9 passed, 9 total
Tests:       54 passed, 54 total
```

## Coverage Added
- Seat lock validation.
- Booking transaction lifecycle validation.
- Financial ledger validation.
- Wallet ledger opening and closing balance validation.
- Payment status history validation.

## Not Covered By Automated Tests
- Live Razorpay settlement.
- Browser checkout against real Razorpay keys.
- Binary PDF rendering.
