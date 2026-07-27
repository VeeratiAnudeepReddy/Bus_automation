# Test Results Sprint 3

## Backend
```text
npm test
Test Suites: 4 passed, 4 total
Tests:       27 passed, 27 total
```

## Frontend
```text
npm run lint
> frontend@0.1.0 lint
> eslint
```

```text
npm run build
✓ Compiled successfully
Routes include /operations, /buses, /drivers, /conductors, /schedules
```

## Runtime Smoke
```text
PORT=5013 npm start
🚀 Server running on port 5013
✅ Connected to MongoDB
```

```text
GET /api/buses
HTTP/1.1 401 Unauthorized
{"error":"Missing bearer token"}
```
