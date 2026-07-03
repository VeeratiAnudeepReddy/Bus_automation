# Test Results Sprint 4

## Backend
```text
> qr-bus-ticketing-backend@1.0.0 test
> jest --runInBand --forceExit

Test Suites: 5 passed, 5 total
Tests:       32 passed, 32 total
```

## Frontend Lint
```text
> frontend@0.1.0 lint
> eslint
```

## Frontend Build
```text
> frontend@0.1.0 build
> next build

Compiled successfully.
Generated 41 app routes including pricing, coupons, bookings, wallet, finance, payments, audit, reports, customer, conductor, and driver routes.
```

## Backend Smoke
```text
PORT=5024 timeout 8s npm start
Server running on port 5024
Connected to MongoDB
```
