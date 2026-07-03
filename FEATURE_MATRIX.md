# Feature Matrix

## Sprint 9 Production Payment, Booking & Financial Integrity

| Feature | Frontend | Backend | Database | API | Tests | Status |
|---|---|---|---|---|---|---|
| Atomic booking lifecycle | API client support | Yes | BookingTransaction | `/bookings`, `/bookings/:id/recover` | Sprint9 tests | Implemented |
| Seat locking | API client support | Yes | SeatLock | `/bookings/seats` | Sprint9 tests | Implemented |
| Gateway-held tickets | Checkout foundation | Yes | Ticket/Payment/SeatLock | `/payments/verify` | Backend tests | Implemented |
| Payment status history | Payment UI foundation | Yes | Payment | Payment/webhook APIs | Sprint9 tests | Implemented |
| Immutable financial ledger | Finance dashboard | Yes | FinancialLedger | `/finance/dashboard`, `/reports` | Sprint9 tests | Implemented |
| Wallet ledger replay | Wallet screens foundation | Yes | WalletLedger | `/wallet/ledger` | Sprint9 tests | Implemented |
| Invoice/receipt access | API client support | Yes | Invoice/Receipt | `/bookings/:id/invoice`, `/bookings/:id/receipt` | Backend tests | Implemented printable HTML |
| Expiry recovery jobs | N/A | Yes | JobHistory/SeatLock/Payment/BookingTransaction | `/jobs/ticket_expiration` | Backend tests | Implemented scheduler hook |

## Sprint 8.5 Razorpay Production Integration

| Feature | Frontend | Backend | Database | API | Tests | Status |
|---|---|---|---|---|---|---|
| Razorpay SDK provider | N/A | Yes | Payment | PaymentService provider | Payment tests | Implemented |
| Standard Checkout | Yes | Yes | Payment | `/payments/create-order`, `/payments/verify` | Build/lint/tests | Implemented, pending live test-mode transaction |
| Webhook verification | N/A | Yes | PaymentWebhook | `/payments/webhook` | Payment tests | Implemented |
| Wallet + gateway split | Yes | Yes | Payment/WalletTransaction | `/payments/create-order` | Build/tests | Implemented foundation |
| Payment finalization | N/A | Yes | Payment/Invoice/Receipt/BookingHistory/Ticket | `/payments/verify` | Build/tests | Implemented |
| Gateway refunds | API/UI foundation | Yes | Refund/Payment | `/payments/:id/refund` | Payment tests | Implemented foundation |

## Sprint 8 Production Infrastructure

| Feature | Frontend | Backend | Database | API | Tests | Status |
|---|---|---|---|---|---|---|
| Production configuration | N/A | Yes | N/A | Startup validation | Sprint8 tests | Implemented |
| Central logging/request IDs | N/A | Yes | N/A | All routes | Build/tests | Implemented JSON logger |
| Global error handling | N/A | Yes | N/A | All routes | Build/tests | Implemented standard middleware |
| Rate limiting | N/A | Yes | In-memory buckets | All routes | Sprint8 tests | Implemented configurable foundation |
| Security hardening | N/A | Yes | Audit/logs | All routes | Build/tests | Implemented headers, CSP, CORS policy, sanitization |
| API versioning | N/A | Yes | N/A | `/api/v1/*`, `/api/meta` | Build/tests | Implemented without breaking legacy `/api` |
| Health and metrics | N/A | Yes | Mongoose/system | `/health`, `/ready`, `/live`, `/metrics` | Sprint8 tests/smoke | Implemented |
| Background jobs | API only | Yes | JobHistory | `/api/jobs*` | Sprint8 tests | Implemented registry foundation |
| Backup metadata | API only | Yes | BackupRecord | `/api/backups` | Sprint8 tests | Implemented metadata foundation |
| Provider abstractions | API/service | Yes | ProviderDelivery | service layer | Sprint8 tests | Email/push/storage queue foundation |
| Deployment assets | N/A | Yes | N/A | Docker/CI scripts | Build config | Implemented |

| Feature | Frontend | Backend | Database | API | Tests | Status |
|---|---|---|---|---|---|---|
| Clerk sign-in/sign-up | Yes | Yes | User | `/auth/sync` | Auth middleware test | Partial |
| Backend JWT verification | N/A | Yes | N/A | Protected APIs | Auth middleware test | Implemented, pending real-token runtime verification |
| User sync | Yes | Yes | User/Organization | `/auth/sync` | Auth middleware test | Partial |
| Organization creation | Yes | Yes | Organization | `/organizations` | Model/build/lint | Implemented |
| Organization dashboard | Yes | Yes | Organization/User/Route/Ticket/AuditLog | `/organizations/:id/dashboard` | Build/lint | Implemented |
| Organization settings | Yes | Yes | Organization | `/organizations/:id` | Model/build/lint | Implemented |
| Organization branding/logo | Yes | Yes | Organization | `/organizations/:id` | Model/build/lint | Implemented |
| Organization members | Yes | Yes | User | `/organizations/:id/members` | Build/lint | Implemented |
| Organization invites | Yes | Yes | OrganizationInvite | `/organizations/:id/invites`, `/invites/:token/accept` | Model/build/lint | Implemented |
| Organization switching | Yes | Yes | Organization/User | `/organizations/:id/switch` | Build/lint | Implemented for single-org users and super admin context |
| Organization approval/suspension | Yes | Yes | Organization/AuditLog | `/organizations/:id/approve`, `/organizations/:id/suspend` | Build/lint | Implemented for super admin |
| Role middleware | Partial | Yes | User.role | Role-gated routes | No | Partial |
| Role editor | No | No | No | No | No | Missing |
| Enterprise user CRUD | Yes | Yes | User/AuditLog | `/users*` | Model/build/lint | Implemented |
| User profile editing | Yes | Yes | User/AuditLog | `/users/:id` | Build/lint | Implemented |
| User suspend/activate/archive/delete/restore | Yes | Yes | User/AuditLog | `/users/:id/*` | Build/lint | Implemented |
| User role assignment | Yes | Yes | User/AuditLog | `/users/:id/role` | Build/lint | Implemented |
| User organization transfer | API only | Yes | User/AuditLog | `/users/:id/transfer` | Build/lint | Implemented for super admin API |
| User search/filter/sort/pagination | Yes | Yes | User | `/users`, `/users/search` | Build/lint | Implemented |
| User bulk actions | Yes | Yes | User/AuditLog | `/users/bulk` | Build/lint | Implemented |
| User import/export | Yes | Yes | User/AuditLog | `/users/import`, `/users/export` | Build/lint | Implemented JSON import and CSV export |
| User activity timeline | Yes | Yes | AuditLog | `/users/activity`, `/users/:id` | Build/lint | Implemented |
| Bus management | Yes | Yes | Bus/AuditLog | `/buses*` | Model/service/build/lint | Implemented |
| Driver management | Yes | Yes | DriverProfile/User/AuditLog | `/drivers*` | Model/service/build/lint | Implemented |
| Conductor management | Yes | Yes | ConductorProfile/User/Ticket/AuditLog | `/conductors*`, `/tickets/scan` | Model/service/build/lint | Implemented |
| Route CRUD | Yes | Yes | Route/Organization/Stop | `/admin/routes*`, `/routes/:id/*` | Build/lint | Extended with assignments/stops/optimization |
| Stops/schedules | Yes | Yes | Stop/Schedule | `/routes/:id/stops`, `/schedules*` | Model/service/build/lint | Implemented |
| Maps pinning | Yes | Route coords | Route/Stop | `/routes`, `/routes/:id/optimize` | Build/lint | Implemented |
| Google Maps | Yes | N/A | N/A | Embedded map preview | Build/lint | Basic embed implemented; production Directions API pending key/billing |
| Assignment engine | Yes | Yes | Bus/DriverProfile/ConductorProfile/Schedule | assignments and schedules APIs | Unit test | Implemented |
| Operations dashboard | Yes | Yes | Bus/DriverProfile/ConductorProfile/Schedule/Ticket | `/operations/dashboard` | Build/lint | Implemented |
| Ticket pricing fixed fare | Yes | Yes | Route/FareHistory | `/admin/routes*` | No | Partial |
| Fare rules/discounts/coupons | Yes | Yes | FareRule/Coupon/FareVersion/PriceApproval | `/pricing*`, `/coupons*` | Sprint4 model/service tests | Implemented foundation |
| Booking purchase | Yes | Yes | Ticket/BookingHistory/Invoice/Receipt/User | `/tickets/book`, `/bookings` | Build/lint + Sprint4 tests | Extended with dynamic pricing, booking IDs, invoices, receipts |
| Booking cancel/refund | Yes | Yes | Refund/BookingHistory/Ticket/WalletTransaction | `/bookings/:id/cancel`, `/refunds` | Build/lint | Implemented foundation |
| Wallet simulation | Yes | Yes | User.balance/WalletTransaction/WalletLedger | `/wallet/add`, `/wallet/recharge`, `/wallet/transactions`, `/wallet/ledger` | Sprint4 model/service tests | Ledger-backed |
| Razorpay payments | Yes | Yes | Payment/PaymentWebhook/Refund | `/payments/create-order`, `/payments/verify`, `/payments/webhook`, `/payments/:id/refund` | Sprint4 signature/model tests | Implemented secure local order/signature foundation; checkout provider runtime pending |
| QR validation | Yes | Yes | Ticket | `/tickets/scan` | No | Partial |
| Posts | No | No | No | No | No | Missing |
| Notifications | Yes | Yes | Notification/NotificationPreference | `/notifications*` | Build/lint | In-app foundation; email/push provider pending |
| Reports | Yes | Yes | Ticket/Refund/Payment/Wallet/Coupon | `/reports`, `/finance/dashboard`, `/audit` | Build/lint | CSV-compatible exports; binary Excel/PDF pending |
| Audit logs | Yes | Partial | AuditLog | `/audit`, org dashboard | Build/lint | Search/export foundation |
| Dedicated dashboards | Customer/admin/org/finance/driver/conductor | N/A | N/A | Dashboard APIs | Build/lint | Partial role dashboard foundation |
| Production deployment | No | No | N/A | N/A | Build/lint only | Missing |
| First-run setup wizard | Yes | Yes | Organization/User | `/auth/setup`, `/auth/platform-status` | Sprint4.5 tests/build/lint | Implemented |
| Signup account decision | Yes | Yes | User | `/auth/customer`, `/auth/organization-owner` | Build/lint | Implemented |
| Employee invite onboarding | Yes | Yes | OrganizationInvite/User | `/auth/invites/:token`, `/auth/invites/:token/accept` | Sprint4.5 tests | Implemented |
| Role-based dashboard routing | Yes | N/A | User.role | Frontend AuthGate | Build/lint | Implemented frontend gate |
| Profile completion gate | Yes | Yes | User | `/auth/profile` | Sprint4.5 tests/build/lint | Implemented |
| Enterprise shell/sidebar | Yes | N/A | N/A | Frontend shell | Build/lint | Implemented |
| Global search launcher | Yes | N/A | N/A | Frontend search page | Build/lint | Implemented |
| Profile/settings/help pages | Yes | Partial | User/Organization | Existing APIs | Build/lint | Implemented foundation |
| 403/404 UX | Yes | N/A | N/A | Frontend pages | Build/lint | Implemented |
| Guided onboarding checklist | Yes | N/A | N/A | Frontend links | Build/lint | Implemented |
| Posts/announcements | Yes | Yes | Post | `/posts*` | Sprint5 tests/build/lint | Implemented foundation |
| Support desk | Yes | Yes | SupportTicket | `/support/tickets*` | Sprint5 tests/build/lint | Implemented foundation |
| Notification read/preferences | Yes | Yes | Notification/NotificationPreference | `/notifications*` | Build/lint | Implemented |
| Module reports | Yes | Yes | Existing collections | `/reports/:module` | Build/lint | Implemented CSV-compatible foundation |
| Global backend search | Yes | Yes | Existing collections | `/search` | Build/lint | Implemented |
| Role-specific landing dashboards | Yes | N/A | User.role | Frontend routing | Build/lint | Implemented |
| Dynamic profile completion | Yes | Yes | User.metadata/profile fields | `/auth/profile` | Build/lint | Implemented |
| Navigation hierarchy audit | Yes | N/A | N/A | Frontend shell | Build/lint | Implemented |
| Fleet/dispatcher dashboards | Yes | N/A | Existing fleet models | Frontend routes | Build/lint | Implemented foundation |
| Dispatcher control center | Yes | Yes | Trip/Bus/DriverProfile/ConductorProfile/Incident/LeaveRequest | `/dispatcher/dashboard` | Build/lint | Implemented |
| Trip execution lifecycle | Yes | Yes | Trip/Schedule | `/trips*` | Sprint6 model tests/build/lint | Implemented |
| Maintenance management | Yes | Yes | MaintenanceRecord/Bus/Notification | `/maintenance*` | Sprint6 model tests/build/lint | Implemented |
| Fuel management | Yes | Yes | FuelRecord/Bus | `/fuel*` | Sprint6 model tests/build/lint | Implemented |
| Leave and availability | Yes | Yes | LeaveRequest/DriverProfile/ConductorProfile | `/leave*` | Sprint6 model tests/build/lint | Implemented |
| Operations calendar | Yes | Yes | Trip/Schedule/MaintenanceRecord/LeaveRequest/Incident | `/calendar` | Build/lint | Implemented |
| Incident management | Yes | Yes | Incident/Notification | `/incidents*` | Sprint6 model tests/build/lint | Implemented |
| Operational notifications | Partial | Yes | Notification | incident/maintenance/leave/trip actions | Build/lint | In-app role notifications implemented; email/push pending |
| Operations analytics | Yes | Yes | Trip/FuelRecord/MaintenanceRecord/Ticket | `/operations/dashboard`, `/dispatcher/dashboard` | Build/lint | Implemented foundation |
| Real-time trip state | Yes | Yes | Trip/TripEvent | `/trips/:id/actions` | Sprint7 model tests/build/lint | Implemented with SSE-ready event publishing |
| Live GPS tracking | Yes | Yes | GPSLocation/Trip | `/trips/:id/location`, `/trips/:id/history` | Sprint7 model tests/build/lint | Implemented |
| Passenger trip tracking | Yes | Yes | Trip/GPSLocation/TripEvent | `/trip-status/:id` | Build/lint | Implemented |
| Real-time event stream | Partial | Yes | In-memory SSE clients | `/realtime/events` | Build/lint | Implemented SSE foundation |
| Driver live app | Yes | Yes | Trip/TripEvent/GPSLocation | `/driver`, trip action APIs | Build/lint | Implemented foundation |
| Conductor live app | Yes | Yes | Trip/TripEvent | `/conductor`, trip action APIs | Build/lint | Implemented foundation |
| Offline sync queue | API only | Yes | OfflineQueue | `/offline/sync` | Sprint7 model tests | Implemented backend foundation |
20 files changed
+1414
-0
￼
￼
￼
￼PROJECT_AUDIT/01_SYSTEM_ARCHITECTURE.md
+65
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
# 01 System Architecture

## Overview
Bus_automation is a mobile-first bus ticketing application with a Next.js frontend, an Express/Mongoose backend, Clerk authentication, MongoDB persistence, QR ticket generation, QR scanning, wallet balance simulation, route/fare CRUD, and partial multi-tenant organization groundwork.

## Detailed explanation
The repository is split into `backend/` and `frontend/`. Root markdown files `01_...20_...` describe a planned larger enterprise system, but the live code implements a smaller subset.

Backend flow:
1. `backend/server.js` loads `.env`, creates an Express app, enables JSON parsing and CORS.
2. It attempts a Mongoose connection using `config.MONGO_URI`.
3. It mounts all API route modules under `/api`.
4. Controllers read/write Mongoose models.

Frontend flow:
1. `frontend/app/layout.tsx` wraps the App Router in `ClerkProvider`.
2. `frontend/proxy.ts` protects feature routes through Clerk middleware.
3. Client pages call `frontend/lib/useAppRole.ts`, which syncs Clerk users to the backend through `POST /api/auth/sync`.
4. API calls use `frontend/lib/api.ts` with `NEXT_PUBLIC_API_URL` and `x-clerk-user-id`.

Authentication flow:
Clerk handles browser sign-in/sign-up. The backend does not verify Clerk JWTs. Backend auth trusts `x-clerk-user-id`, looks up `User.clerkUserId`, and attaches the user to `req.user`.

Authorization flow:
Backend role middleware lives in `backend/middleware/permissions.js` and `backend/middleware/adminMiddleware.js`. Frontend pages use `role === 'admin'` and `role === 'fare_manager'`, which is inconsistent with newer backend normalized roles such as `conductor` and `price_manager`.

Database flow:
Mongoose models: `User`, `Organization`, `Route`, `Ticket`, `FareHistory`, `AuditLog`, `ValidationLog`. `organizationId` is required on `User`, `Route`, `Ticket`, and `FareHistory`, but some controllers still create records without it.

Request lifecycle:
Browser -> Clerk session -> Next page -> `apiService` -> Express route -> `requireAuth` where used -> role middleware where used -> controller -> Mongoose -> JSON response.

Deployment flow:
No CI/CD or deployment manifests exist. Local setup uses `npm install`, backend `npm start`, frontend `npm run dev`. Production requires MongoDB, Clerk production keys, and API URL configuration.

## Code references
- `backend/server.js`
- `backend/config.js`
- `backend/routes/*.js`
- `backend/controllers/*.js`
- `backend/models/*.js`
- `frontend/app/layout.tsx`
- `frontend/proxy.ts`
- `frontend/lib/api.ts`
- `frontend/lib/useAppRole.ts`

## File references
- Root planning docs: `01_Project_Analysis.md` through `20_Coding_Agent_Tasks.md`
- Frontend docs: `frontend/README.md`, `frontend/CLERK_SETUP.md`
- Backend docs: `backend/README.md`, `backend/API_SUMMARY.md`

## API references
Live API is mounted under `/api`: auth sync, wallet, tickets, routes, admin routes, admin analytics, and organizations. See `03_API_DOCUMENTATION.md`.

## Screens
Implemented screens: `/`, `/sign-in`, `/sign-up`, `/register`, `/wallet`, `/generate`, `/tickets`, `/tickets/[ticketId]`, `/admin`, `/admin/fares`, `/dashboard` redirect, `/scanner` redirect.

## Dependencies
Backend: Express, Mongoose, MongoDB driver, CORS, dotenv, qrcode, uuid. Frontend: Next.js 16, React 19, Clerk, Axios, Framer Motion, Leaflet, React Leaflet, html5-qrcode, Lucide, react-hot-toast.

## Current status
Partially implemented. Core ticket/wallet/routes/scanner flows exist. Enterprise modules in planning docs are mostly NOT IMPLEMENTED.

## Recommendations
Fix backend auth to verify Clerk tokens, resolve `organizationId` creation gaps, align frontend/backend role names, add real tests, and complete production payment/security work before deployment.
￼PROJECT_AUDIT/02_DATABASE_DOCUMENTATION.md
+151
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
# 02 Database Documentation

## Overview
The live database layer uses Mongoose models in `backend/models`. Collections documented below are the only collections implemented in code.

## Detailed explanation
### User
File: `backend/models/User.js`

Fields:
- `name`: String, required.
- `email`: String, required, unique.
- `phone`: String, default `N/A`.
- `balance`: Number, default `1000`, minimum `0`.
- `role`: String enum. Implemented enum values include old roles `user`, `admin`, `fare_manager`; preferred roles `customer`, `conductor`, `price_manager`; reserved roles `super_admin`, `org_owner`, `regional_admin`, `depot_manager`, `fleet_manager`, `finance_manager`, `operations_manager`, `dispatcher`, `driver`, `support`.
- `clerkUserId`: String, sparse unique, indexed.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps: `createdAt`, `updatedAt`.

Indexes: `email`, `clerkUserId`, and schema-level unique constraints.

Sample:
```json
{
  "name": "Passenger",
  "email": "user@example.com",
  "phone": "9999999999",
  "balance": 1000,
  "role": "customer",
  "clerkUserId": "user_xxx",
  "organizationId": "ObjectId"
}
```

Important issue: `authController.syncClerkUser` creates users without `organizationId`, which conflicts with the required schema.

### Organization
File: `backend/models/Organization.js`

Fields:
- `name`: String, required, trim.
- `slug`: String, required, unique, lowercase, trim, regex `/^[a-z0-9-]+$/`, indexed.
- `city`: String, default `Hyderabad`, indexed.
- `status`: enum `pending`, `active`, `suspended`, default `pending`, indexed.
- `ownerUserId`: ObjectId ref `User`, required, indexed.
- `billingContact.name/email/phone`: nullable strings.
- timestamps.

Indexes: `{ slug: 1 }` unique, `{ status: 1, createdAt: -1 }`.

### Route
File: `backend/models/Route.js`

Fields:
- `from`, `to`: String, required, trim.
- `fromNormalized`, `toNormalized`: String, required, trim, indexed.
- `fare`: Number, required, min `1`.
- `city`: String, required, default `Hyderabad`, indexed.
- `active`: Boolean, default `true`, indexed.
- `fromCoords`, `toCoords`: embedded `{ lat, lng }`, both required numbers.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Unique index: `{ organizationId, city, fromNormalized, toNormalized }`.

Important issue: `routeController.ensureHyderabadSeedRoutes` and `createRoute` create routes without `organizationId`, conflicting with the required schema.

### Ticket
File: `backend/models/Ticket.js`

Fields:
- `ticketId`: String, required, unique, indexed.
- `userId`: ObjectId ref `User`, required, indexed.
- `routeId`: ObjectId ref `Route`, nullable, indexed.
- `from`, `to`: nullable String.
- `status`: enum `ACTIVE`, `USED`, default `ACTIVE`, indexed.
- `fare`: Number, required.
- `scannedAt`: Date, nullable.
- `scannedBy`: ObjectId ref `User`, nullable, indexed.
- `fromCoords`, `toCoords`: nullable lat/lng objects.
- `qrPayload`: embedded ticket data with required `ticketId`, `userId`, `timestamp`.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Indexes: `{ userId: 1, createdAt: -1 }`, `{ scannedBy: 1, scannedAt: -1 }`.

Important issue: `ticketController.bookTickets` inserts tickets without `organizationId`.

### FareHistory
File: `backend/models/FareHistory.js`

Fields:
- `routeId`: ObjectId ref `Route`, required, indexed.
- `previousFare`: Number, required.
- `newFare`: Number, required.
- `updatedBy`: ObjectId ref `User`, required.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Index: `{ routeId: 1, createdAt: -1 }`.

Important issue: `routeController.updateRoute` creates fare history without `organizationId`.

### AuditLog
File: `backend/models/AuditLog.js`

Fields:
- `organizationId`: ObjectId ref `Organization`, nullable, indexed.
- `actorId`: ObjectId ref `User`, nullable.
- `action`: required enum.
- `targetType`: enum `User`, `Organization`, `Route`, `FareRule`, `Post`, `PaymentTransaction`, null.
- `targetId`: ObjectId, nullable, indexed.
- `before`, `after`, `metadata`: Mixed.
- timestamps.

Indexes: `{ organizationId, createdAt }`, `{ action, createdAt }`, `{ targetType, targetId, createdAt }`.

Important issue: `organizationController.updateOrganization` writes action `org_updated`, but `org_updated` is not in the enum.

### ValidationLog
File: `backend/models/ValidationLog.js`

Fields:
- `ticketId`: String, required, indexed.
- `userId`: ObjectId ref `User`, nullable.
- `status`: enum `VALID`, `INVALID`, `ALREADY_USED`, required.
- `scannedAt`: Date, default now, indexed.
- timestamps.

Status: Model exists, but no live route/controller mounts it.

## Code references
`backend/models/User.js`, `Organization.js`, `Route.js`, `Ticket.js`, `FareHistory.js`, `AuditLog.js`, `ValidationLog.js`.

## File references
Planning references: `05_Database_Changes.md`, `07_Role_Hierarchy.md`, `15_Migration_Strategy.md`.

## API references
Database operations are used by auth sync, wallet add, ticket book/list/scan, route CRUD, admin analytics, and organization endpoints.

## Screens
Database-backed screens: home, register, wallet, generate, tickets, ticket detail, admin, fares.

## Dependencies
Mongoose and MongoDB.

## Current status
Schema layer is partially migrated to multi-tenancy, but controllers are not consistently updated for required `organizationId`.

## Recommendations
Run migration verification before use; fix all record creation paths to include `organizationId`; add integration tests for required field validation.
￼PROJECT_AUDIT/03_API_DOCUMENTATION.md
+167
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
# 03 API Documentation

## Overview
All live backend endpoints are mounted under `/api` in `backend/server.js`. Authentication is implemented by `requireAuth`, which trusts `x-clerk-user-id` and loads a Mongo `User`.

## Detailed explanation
### GET /
Purpose: health check. Auth: none. Controller: inline in `server.js`. Response: `{ "message": "QR Bus Ticketing System API is running" }`.

Example:
```bash
curl http://localhost:5001/
```

### POST /api/auth/sync
Purpose: sync a Clerk user into Mongo. Auth: none at route level. Controller: `authController.syncClerkUser`.
Body: `clerkUserId` required, `email` required, `name`, `phone`.
Database: `User.findOne`, `User.create`.
Frontend callers: `useAppRole`, `/register`, ticket detail.
Errors: `400` missing IDs/email or duplicate email; `500` failed sync.
Important issue: creates user without required `organizationId`.

Example:
```bash
curl -X POST http://localhost:5001/api/auth/sync -H "Content-Type: application/json" -d '{"clerkUserId":"user_x","email":"user@example.com","name":"User"}'
```

### POST /api/wallet/add
Purpose: add test wallet balance. Auth: `requireAuth`. Role: any authenticated user.
Body: `amount` positive number, max `50000`.
Controller: `walletController.addBalance`.
Database: `User.findByIdAndUpdate($inc)`.
Frontend callers: `/wallet`.
Errors: `400` invalid amount or too high; `401`; `500`.

### POST /api/tickets/book
Purpose: book one or more QR tickets and debit wallet. Auth: `requireAuth`. Role: any authenticated user.
Body: `count`, optional `routeId`, `from`, `to`, `fromCoords`, `toCoords`.
Controller: `ticketController.bookTickets`.
Database: `Route.findOne`, `User.findOneAndUpdate`, `Ticket.insertMany` inside transaction.
Frontend callers: `/generate`.
Errors: `400` invalid count, unavailable route, insufficient balance; `500`.
Important issue: inserts tickets without required `organizationId`.

### GET /api/tickets/my
Purpose: list current user's recent tickets and wallet balance. Auth: `requireAuth`.
Controller: `ticketController.getMyTickets`.
Database: `Ticket.find({ userId })`.
Frontend callers: `/`, `/wallet`, `/generate`, `/tickets`, `/tickets/[ticketId]`.
Errors: `401`; `500`.

### POST /api/tickets/scan
Purpose: scan/validate a QR payload. Auth: `requireAuth`, `requireAdmin`.
Required role: backend accepts `conductor`, `org_owner`, `super_admin`, and old `admin` through translation.
Body: `scannedData`.
Controller: `ticketController.scanTicket`.
Database: atomic `Ticket.findOneAndUpdate({ ticketId, status: 'ACTIVE' })`, fallback `Ticket.findOne`.
Frontend callers: `/admin`.
Responses: `VALID`, `INVALID`, or `REJECT`.

### GET /api/admin/analytics
Purpose: scanner analytics for current staff user. Auth: `requireAuth`, `requireAdmin`.
Controller: `adminController.getAnalytics`.
Database: `Ticket.countDocuments`, `Ticket.aggregate`.
Frontend callers: `/admin`.

### GET /api/routes
Purpose: active route list, stops, and popular routes. Auth: `requireAuth`.
Query: `city`, `from`, `to`.
Controller: `routeController.getRoutesForUser`.
Database: seeds Hyderabad routes, then `Route.find`.
Frontend callers: `/generate`.
Important issue: seed route creation lacks required `organizationId`.

### GET /api/admin/routes
Purpose: admin fare route list. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Required role: `price_manager`, `org_owner`, `super_admin`, old `fare_manager`, old `admin`.
Query: `city`, `search`, `status`.
Controller: `routeController.getAdminRoutes`.
Frontend callers: `/admin/fares`.

### POST /api/admin/routes/create
Purpose: create route/fare. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Body: `from`, `to`, `fare`, `fromCoords`, `toCoords`, optional `city`, `active`.
Controller: `routeController.createRoute`.
Important issue: creates route without required `organizationId`.

### PUT /api/admin/routes/:id
Purpose: update route/fare. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Path: `id`.
Controller: `routeController.updateRoute`.
Database: `Route.findById`, `Route.findByIdAndUpdate`, optional `FareHistory.create`.
Important issue: fare history create lacks required `organizationId`.

### DELETE /api/admin/routes/:id
Purpose: delete route. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Controller: `routeController.deleteRoute`.
Database: `Route.findByIdAndDelete`.

### PATCH /api/admin/routes/:id/toggle
Purpose: toggle active status. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Controller: `routeController.toggleRoute`.

### GET /api/admin/routes/fare-history
Purpose: route fare history. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Query: optional `routeId`.
Controller: `routeController.getFareHistory`.
Database: `FareHistory.find`, populate route and user.

### POST /api/organizations
Purpose: authenticated user creates one pending organization and becomes `org_owner`.
Auth: `requireAuth`.
Controller: `organizationController.createOrganization`.
Body: `name`, `slug`, optional `city`.
Database: `Organization.create`, `AuditLog.create`, `User.updateOne`.

### GET /api/organizations/:id
Purpose: organization details. Auth: `requireAuth`.
Access: organization member or `super_admin`.
Controller: `organizationController.getOrganization`.

### PATCH /api/organizations/:id
Purpose: update organization. Auth: `requireAuth`, `requireRole('org_owner')`.
Body: `name`, `city`, `billingContact`.
Controller: `organizationController.updateOrganization`.
Important issue: controller allows `super_admin`, but route middleware only permits `org_owner`; audit action `org_updated` is not in enum.

### POST /api/organizations/:id/approve
Purpose: approve pending organization. Auth: `requireAuth`, `requireSuperAdmin`.
Controller: `organizationController.approveOrganization`.

### POST /api/organizations/:id/suspend
Purpose: suspend organization. Auth: `requireAuth`, `requireSuperAdmin`.
Controller: `organizationController.suspendOrganization`.

### POST /api/organizations/:id/invites
Purpose: create in-memory team invite token. Auth: `requireAuth`, `requireRole('org_owner')`.
Body: `email`, `role`.
Controller: `organizationController.sendInvite`.
Status: email sending NOT IMPLEMENTED; token store is in-memory only.

### POST /api/invites/:token/accept
Purpose: accept an invite after Clerk signup. Auth: `requireAuth`.
Controller: `organizationController.acceptInvite`.
Database: `Organization.findById`, `User.updateOne`, `AuditLog.create`.
Status: no frontend page exists for `/accept-invite`.

## Code references
`backend/routes/*.js`, `backend/controllers/*.js`, `backend/middleware/*.js`, `frontend/lib/api.ts`.

## File references
`backend/server.js`, `backend/API_SUMMARY.md`, `06_API_Changes.md`.

## API references
The endpoints above are the complete live API surface found in mounted route files.

## Screens
Frontend callers are listed per endpoint. Organization APIs currently have no implemented UI.

## Dependencies
Express, Mongoose, qrcode, uuid, Axios.

## Current status
Ticket/wallet/admin route APIs exist but several write paths conflict with required multi-tenant fields.

## Recommendations
Add JWT verification, org scoping in every query, request validation, API tests, and fix required `organizationId` writes.
￼PROJECT_AUDIT/04_ROLE_ACCESS_MATRIX.md
+58
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
# 04 Role Access Matrix

## Overview
The code contains old roles and a newer planned hierarchy. Only a few roles are actually usable through UI/API today.

## Detailed explanation
| Requested role | Code role value | Exists in enum | UI support | API support | Status |
|---|---|---:|---:|---:|---|
| Super Admin | `super_admin` | Yes | No | Org approve/suspend | Partial |
| Organization Owner | `org_owner` | Yes | No | Org update/invite, admin route APIs | Partial |
| Admin | `admin` | Yes old role | Yes | Translates to conductor | Implemented legacy |
| Manager | NOT IMPLEMENTED | No exact role | No | No | NOT IMPLEMENTED |
| Dispatcher | `dispatcher` | Yes reserved | No | No dedicated APIs | NOT IMPLEMENTED |
| Driver | `driver` | Yes reserved | No | No dedicated APIs | NOT IMPLEMENTED |
| Conductor | `conductor` | Yes | No frontend checks | Ticket scan via backend | Partial |
| Finance | `finance_manager` | Yes | No | No finance APIs | NOT IMPLEMENTED |
| Ticket Manager | NOT IMPLEMENTED | No exact role | No | No | NOT IMPLEMENTED |
| Price Manager | `price_manager` | Yes | No frontend checks | Fare APIs via backend | Partial |
| Customer | `customer` | Yes | No frontend checks | User routes if record exists | Partial |
| Guest | unauthenticated | N/A | Home sign-in/sign-up | No API except `/auth/sync` | Partial |

Legacy roles:
- `user`: frontend type and old backend default in sync controller.
- `admin`: frontend admin/scanner role.
- `fare_manager`: frontend fare manager role.

Permissions:
- `requireAdmin`: `conductor`, `org_owner`, `super_admin`, plus old `admin`.
- `requireFareManagerOrAdmin`: `price_manager`, `org_owner`, `super_admin`, plus old `fare_manager`/`admin`.
- `requireSuperAdmin`: exact `super_admin`.
- `requireRole`: exact or translated role comparison.

Limitations:
- Frontend checks only `admin` and `fare_manager`; it does not recognize `conductor`, `price_manager`, `org_owner`, or `super_admin` for dashboard branching.
- No inheritance model beyond hardcoded middleware lists.
- No UI exists for role assignment except organization invite API response token.
- No pages exist for super admin, org owner, driver, dispatcher, finance, support, or ticket manager.

## Code references
`backend/models/User.js`, `backend/middleware/permissions.js`, `backend/middleware/adminMiddleware.js`, `frontend/lib/api.ts`, `frontend/app/admin/page.tsx`, `frontend/app/admin/fares/page.tsx`.

## File references
`07_Role_Hierarchy.md`, `18_Implementation_Checklist.md`, `PHASE1_COMPLETION_REPORT.md`.

## API references
Role-gated APIs: `/api/tickets/scan`, `/api/admin/analytics`, `/api/admin/routes*`, `/api/organizations/:id`, `/api/organizations/:id/approve`, `/api/organizations/:id/suspend`, `/api/organizations/:id/invites`.

## Screens
Implemented role screens: customer pages, legacy admin dashboard, legacy fare management page. Other requested dashboards: NOT IMPLEMENTED.

## Dependencies
No external RBAC package. Custom middleware only.

## Current status
RBAC is partially implemented and inconsistent between backend and frontend.

## Recommendations
Define one canonical role set, migrate frontend checks, add role management UI/API, and add organization isolation tests.
￼PROJECT_AUDIT/05_USER_CREATION_GUIDE.md
+72
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
# 05 User Creation Guide

## Overview
Users are primarily created through Clerk sign-up plus backend sync. Admin/team roles require manual DB changes or incomplete organization invite APIs.

## Detailed explanation
### Passenger / Customer
UI: sign up through Clerk, then visit `/register` or any page using `useAppRole`.
API: `POST /api/auth/sync`.
Required fields: `clerkUserId`, `email`; optional `name`, `phone`.
Current blocker: `User.organizationId` is required, but sync does not set it. User creation may fail unless schema/data differs or the code is fixed.

### Admin / Conductor
No UI to create directly. Possible only by manual Mongo update to old `admin` or new `conductor`, or by org invite API if an org owner exists and invite token is accepted.
Dashboard: `/admin` works for old `admin` in frontend. New `conductor` is backend-authorized but frontend does not treat it as admin.

### Price Manager / Fare Manager
No UI to create directly. Manual Mongo update to old `fare_manager` or new `price_manager`, or org invite API. Frontend only recognizes old `fare_manager`.

### Super Admin
No seed script and no UI. Manual database insert/update only.
Example concept:
```js
db.users.updateOne({ email: "owner@example.com" }, { $set: { role: "super_admin" } })
```
Exact insert requires valid `organizationId` unless schema is changed.

### Organization
API exists: `POST /api/organizations` by an authenticated user. It creates a pending org and sets user role to `org_owner`.
UI: NOT IMPLEMENTED.

### Manager
NOT IMPLEMENTED. No exact role.

### Conductor
Partial. Role exists and backend middleware supports it; frontend does not recognize it.

### Driver
Role enum exists. Creation flow, dashboard, APIs: NOT IMPLEMENTED.

### Ticket Manager
NOT IMPLEMENTED. No exact role exists.

### Finance Manager
Enum exists. Creation UI/API and dashboard: NOT IMPLEMENTED.

### Seed scripts
No general seed script exists. Migration scripts exist:
- `backend/migrations/001_backfill_default_org.js`
- `backend/migrations/002_translate_roles.js`
These are migration helpers, not complete user seeders.

## Code references
`frontend/app/register/page.tsx`, `frontend/lib/useAppRole.ts`, `backend/controllers/authController.js`, `backend/controllers/organizationController.js`, `backend/migrations/*.js`.

## File references
`USER_FLOW_GUIDE.md`, `ADMIN_USER_SYSTEM.md`, `07_Role_Hierarchy.md`.

## API references
`POST /api/auth/sync`, `POST /api/organizations`, `POST /api/organizations/:id/invites`, `POST /api/invites/:token/accept`.

## Screens
Passenger registration exists at `/register`. Organization/team onboarding screens: NOT IMPLEMENTED.

## Dependencies
Clerk for identity; MongoDB for app user rows.

## Current status
User creation is fragile because current schema requires organization ownership/context earlier than the frontend registration flow supplies it.

## Recommendations
Add a supported bootstrap path for default org/customer creation, super admin seed, and role assignment UI/API.
￼PROJECT_AUDIT/06_AUTHENTICATION_DOCUMENTATION.md
+56
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
# 06 Authentication Documentation

## Overview
Frontend authentication uses Clerk. Backend authentication is not true Clerk JWT verification; it trusts an `x-clerk-user-id` request header.

## Detailed explanation
Clerk:
- `frontend/app/layout.tsx` wraps app in `<ClerkProvider>`.
- `/sign-in` renders `<SignIn />`.
- `/sign-up` renders `<SignUp />`.
- `SignInButton`, `SignUpButton`, and `UserButton` are used on home/navbar.

Protected routes:
`frontend/proxy.ts` protects `/dashboard`, `/admin`, `/register`, `/wallet`, `/generate`, `/tickets`, `/scanner`, and all nested paths matching those patterns.

Public routes:
`/`, `/sign-in`, `/sign-up`, static assets, and unlisted routes.

Backend auth:
`backend/middleware/authMiddleware.js` checks `x-clerk-user-id`, loads `User.findOne({ clerkUserId })`, and sets `req.user`.

JWT:
NOT IMPLEMENTED on backend. No Clerk JWT verification code was found.

Organization sync:
Partial. `POST /api/organizations` can assign `organizationId` and `org_owner`, but normal auth sync does not handle organization creation.

User sync:
`useAppRole` calls `/auth/sync` after Clerk loads. This may fail because `organizationId` is required by the schema.

Role assignment:
Partial. Org owner invite endpoint can assign a role on accept, but tokens are in-memory and no email or frontend accept page exists.

Session flow:
Browser Clerk session -> Next route allowed by proxy -> client sends Clerk user ID header -> backend loads user. This is insecure if API is exposed because clients can forge the header.

## Code references
`frontend/app/layout.tsx`, `frontend/app/sign-in/[[...sign-in]]/page.tsx`, `frontend/app/sign-up/[[...sign-up]]/page.tsx`, `frontend/proxy.ts`, `frontend/lib/useAppRole.ts`, `backend/middleware/authMiddleware.js`.

## File references
`frontend/CLERK_SETUP.md`, `CLERK_IMPLEMENTATION.md`, `CLERK_READY.md`.

## API references
`POST /api/auth/sync`, every `requireAuth` endpoint.

## Screens
`/sign-in`, `/sign-up`, `/register`, and all protected app pages.

## Dependencies
`@clerk/nextjs`.

## Current status
Frontend Clerk auth works. Backend API auth is not production-grade.

## Recommendations
Use Clerk server-side token verification, remove trust in raw `x-clerk-user-id`, and add webhook or secure sync flow.
￼PROJECT_AUDIT/07_FRONTEND_PAGES.md
+55
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
# 07 Frontend Pages

## Overview
The frontend uses Next.js App Router under `frontend/app`.

## Detailed explanation
| URL | File | Purpose | Role | API calls | Status |
|---|---|---|---|---|---|
| `/` | `app/page.tsx` | Home, auth CTA, wallet/ticket summary | Guest/customer; redirects old admin/fare_manager | `/auth/sync`, `/tickets/my` | Implemented |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign in | Guest | Clerk | Implemented |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign up | Guest | Clerk | Implemented |
| `/register` | `app/register/page.tsx` | Profile sync | Authenticated | `/auth/sync` | Implemented but may fail schema |
| `/wallet` | `app/wallet/page.tsx` | Wallet balance/top-up/history | Customer | `/tickets/my`, `/wallet/add` | Implemented |
| `/generate` | `app/generate/page.tsx` | Select route/map and book ticket | Customer | `/tickets/my`, `/routes`, `/tickets/book` | Implemented |
| `/tickets` | `app/tickets/page.tsx` | Ticket list | Customer | `/tickets/my` | Implemented |
| `/tickets/[ticketId]` | `app/tickets/[ticketId]/page.tsx` | QR detail, download/share | Customer | `/tickets/my`, `/auth/sync` | Implemented |
| `/admin` | `app/admin/page.tsx` | Scanner and analytics | old `admin`, old `fare_manager` | `/admin/analytics`, `/tickets/scan` | Implemented legacy |
| `/admin/fares` | `app/admin/fares/page.tsx` | Route/fare CRUD | old `admin`, old `fare_manager` | `/admin/routes*` | Implemented legacy |
| `/dashboard` | `app/dashboard/page.tsx` | Redirect to `/` | Protected | none | Implemented redirect |
| `/scanner` | `app/scanner/page.tsx` | Redirect to `/admin` | Protected | none | Implemented redirect |

Navigation:
- `Navbar` links to `/`.
- `BottomTabBar` links to `/`, `/tickets`, `/wallet`.
- Home links to `/wallet`, `/generate`, `/tickets`.
- Admin links to `/admin/fares`.
- Ticket cards link to `/tickets/[ticketId]`.

Missing pages:
- Organization onboarding/admin pages: NOT IMPLEMENTED.
- Invite accept page `/accept-invite`: NOT IMPLEMENTED.
- Super admin dashboard: NOT IMPLEMENTED.
- Driver/dispatcher/finance dashboards: NOT IMPLEMENTED.
- Posts, payments, buses, assignments: NOT IMPLEMENTED.

## Code references
`frontend/app/**/page.tsx`, `frontend/components/Navbar.tsx`, `frontend/components/BottomTabBar.tsx`.

## File references
`frontend/README.md`, `README.md`.

## API references
See table.

## Screens
All implemented routes listed above. No screenshots were generated during this audit.

## Dependencies
Next.js App Router, Clerk, Axios, Leaflet, html5-qrcode.

## Current status
Core passenger/admin legacy pages exist. Enterprise admin pages are NOT IMPLEMENTED.

## Recommendations
Align role checks with backend canonical roles and add missing org/team management pages.
￼PROJECT_AUDIT/08_MAPS_DOCUMENTATION.md
+52
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
# 08 Maps Documentation

## Overview
The project implements Leaflet/OpenStreetMap map pinning for route-based ticket booking. Google Maps and Mapbox are NOT IMPLEMENTED.

## Detailed explanation
Implementation:
- `frontend/components/RouteMapPicker.tsx` imports `leaflet/dist/leaflet.css`.
- Uses `react-leaflet` `MapContainer`, `TileLayer`, `CircleMarker`, `Polyline`, and click events.
- Tile provider: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- `/generate` allows choosing from/to stops, pinning on map, and using browser geolocation.
- Stops and route coordinates come from `GET /api/routes`.

Current capabilities:
- Show stop markers.
- Select source/destination by map click.
- Show from/to markers and a straight polyline.
- Use current browser geolocation.
- Snap typed/pinned points to nearest known stop within 2 km.

Missing capabilities:
- Google Maps: NOT IMPLEMENTED.
- Mapbox: NOT IMPLEMENTED.
- Turn-by-turn routing: NOT IMPLEMENTED.
- Live GPS buses: NOT IMPLEMENTED.
- Driver tracking: NOT IMPLEMENTED.
- ETA calculation: NOT IMPLEMENTED.
- Route alternatives/circular routes: NOT IMPLEMENTED.

Configuration:
No API key is required for current OpenStreetMap tile usage. No maps env var exists.

## Code references
`frontend/components/RouteMapPicker.tsx`, `frontend/app/generate/page.tsx`, `backend/controllers/routeController.js`, `backend/models/Route.js`.

## File references
`10_Maps_Module.md`, `11_Routing_Module.md`.

## API references
`GET /api/routes`, admin route CRUD endpoints.

## Screens
Map appears on `/generate`.

## Dependencies
`leaflet`, `react-leaflet`, browser geolocation.

## Current status
Basic map pinning is implemented. Advanced maps/routing are NOT IMPLEMENTED.

## Recommendations
Keep OSM for low-cost dev or add a selected provider with restricted browser keys, route API, ETA cache, and clear billing controls.
￼PROJECT_AUDIT/09_PAYMENT_DOCUMENTATION.md
+48
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
# 09 Payment Documentation

## Overview
Real payments are NOT IMPLEMENTED. The only implemented payment-like behavior is a test wallet top-up endpoint that increments balance.

## Detailed explanation
Implemented:
- Wallet balance stored on `User.balance`.
- `/wallet` page lets users enter an amount.
- `POST /api/wallet/add` increments balance.
- Backend rejects non-positive amounts and amounts over `50000`.
- Activity history for recharge is stored in browser `localStorage`.

NOT IMPLEMENTED:
- Razorpay orders.
- Razorpay checkout.
- Razorpay webhook.
- Signature verification.
- PaymentTransaction model.
- Refunds.
- Stripe.
- Cash workflow.
- Invoices/GST.
- Organization payout/sub-account flow.

Security/business limitation:
Anyone with a valid user record can call `/api/wallet/add` and add test balance. This is not real money movement.

## Code references
`frontend/app/wallet/page.tsx`, `frontend/lib/api.ts`, `backend/routes/walletRoutes.js`, `backend/controllers/walletController.js`, `backend/models/User.js`.

## File references
`12_Razorpay_Module.md`, `18_Implementation_Checklist.md`.

## API references
`POST /api/wallet/add`.

## Screens
`/wallet`.

## Dependencies
No payment SDK dependency exists.

## Current status
Development wallet only. Production payments NOT IMPLEMENTED.

## Recommendations
Do not launch paid usage until Razorpay/Stripe order creation, webhook verification, idempotency, and audit logs are implemented.
￼PROJECT_AUDIT/10_NOTIFICATION_DOCUMENTATION.md
+42
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
# 10 Notification Documentation

## Overview
Notifications are mostly NOT IMPLEMENTED.

## Detailed explanation
Implemented:
- UI toast notifications through `react-hot-toast`.
- Browser-native share/copy behavior on ticket detail.
- In-memory invite token response includes an `acceptLink`.

NOT IMPLEMENTED:
- Email sending.
- SMS.
- Push notifications.
- Websocket/real-time updates.
- Invite email delivery.
- Payment receipts.
- Operational alerts.

The organization invite controller contains a TODO for email sending and returns the token/link directly in the API response.

## Code references
`backend/controllers/organizationController.js`, `frontend/app/*`, `frontend/app/layout.tsx`.

## File references
`19_Future_Roadmap.md`, `13_Additional_Features.md`.

## API references
`POST /api/organizations/:id/invites` returns `acceptLink`; no notification API exists.

## Screens
Toast notifications appear across wallet, registration, ticket generation, scanner, and fare management screens.

## Dependencies
`react-hot-toast`. No email/SMS/websocket provider dependency exists.

## Current status
Only local UI notifications are implemented.

## Recommendations
Add durable invite storage and email delivery before relying on team onboarding.
￼PROJECT_AUDIT/11_IMPLEMENTED_FEATURES.md
+50
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
# 11 Implemented Features

## Overview
This file lists features present in actual code, not merely in planning docs.

## Detailed explanation
Implemented:
- Next.js App Router frontend.
- Clerk sign-in/sign-up routes.
- Clerk route protection through `proxy.ts`.
- Home page with guest CTA and user summary.
- Backend user sync endpoint.
- Wallet balance display and test recharge.
- Ticket booking with QR payload and QR image generation.
- Ticket list and ticket detail QR display.
- Ticket download/share.
- Route selection by stops.
- Leaflet/OpenStreetMap pinning and geolocation support.
- Backend route listing with seeded Hyderabad route data intent.
- Backend route/fare CRUD endpoints.
- Fare management UI.
- Admin/scanner page using camera scanner and manual input.
- Ticket scan endpoint with atomic active-to-used update.
- Scanner analytics for current scanner.
- Organization model.
- Organization create/get/update/approve/suspend/invite/accept API code.
- Role middleware with legacy role translation.
- Migration scripts for default org and role translation.
- Organization model tests file.

## Code references
All implementation files in `backend/` and `frontend/`.

## File references
`PHASE1_COMPLETION_REPORT.md`, `18_Implementation_Checklist.md`.

## API references
All live endpoints in `03_API_DOCUMENTATION.md`.

## Screens
All implemented pages in `07_FRONTEND_PAGES.md`.

## Dependencies
Backend and frontend package dependencies as listed in their package files.

## Current status
Implemented features are usable only after resolving current schema/auth/role mismatches and environment setup.

## Recommendations
Prioritize stabilization of implemented features before adding planned modules.
￼PROJECT_AUDIT/12_MISSING_FEATURES.md
+59
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
# 12 Missing Features

## Overview
This compares root implementation plans against actual code.

## Detailed explanation
Missing or incomplete features:
- Full enterprise role dashboards: NOT IMPLEMENTED.
- Super admin UI: NOT IMPLEMENTED.
- Organization owner UI: NOT IMPLEMENTED.
- Manager/dispatcher/driver/finance/ticket manager dashboards: NOT IMPLEMENTED.
- Role assignment UI: NOT IMPLEMENTED.
- Persistent invite storage: NOT IMPLEMENTED.
- Invite email delivery: NOT IMPLEMENTED.
- `/accept-invite` page: NOT IMPLEMENTED.
- Post module (`Post`, comments, likes, attachments): NOT IMPLEMENTED.
- Razorpay module and `PaymentTransaction`: NOT IMPLEMENTED.
- Refunds and financial reconciliation: NOT IMPLEMENTED.
- Google Maps/Mapbox integration: NOT IMPLEMENTED.
- ETA, live GPS, bus tracking, bus assignment: NOT IMPLEMENTED.
- Buses model: NOT IMPLEMENTED.
- Drivers/conductors assignment to buses/routes: NOT IMPLEMENTED.
- Pricing rules beyond fixed route fare: NOT IMPLEMENTED.
- Price approval workflow: NOT IMPLEMENTED.
- Notifications beyond UI toasts: NOT IMPLEMENTED.
- Webhooks for Clerk or payments: NOT IMPLEMENTED.
- JWT verification on backend: NOT IMPLEMENTED.
- CI/CD: NOT IMPLEMENTED.
- Production deployment config: NOT IMPLEMENTED.

Broken/inconsistent implemented areas:
- `User.organizationId` required but `/auth/sync` does not provide it.
- `Route.organizationId` required but seed/create route code omits it.
- `Ticket.organizationId` required but ticket booking omits it.
- `FareHistory.organizationId` required but fare update omits it.
- `AuditLog.action` lacks `org_updated` used by controller.
- Frontend role checks use old roles only.
- Backend test script references missing `jest`.

## Code references
See files listed in other audit documents.

## File references
Planning docs: `05_Database_Changes.md`, `06_API_Changes.md`, `08_Ticket_Pricing_Module.md`, `09_Post_Module.md`, `10_Maps_Module.md`, `11_Routing_Module.md`, `12_Razorpay_Module.md`, `19_Future_Roadmap.md`.

## API references
Missing planned APIs include `/api/posts*`, `/api/payments*`, advanced maps/routing APIs, buses/assignments APIs, and user role-management APIs.

## Screens
Missing planned screens include posts, payments, org onboarding, super admin, role management, bus/fleet/driver dashboards.

## Dependencies
No Razorpay/Stripe/email/SMS/maps provider SDKs are installed.

## Current status
The repo is between Phase 1 migration and later planned phases.

## Recommendations
Treat planning docs as backlog, not current capability. Fix current breakages first.
￼PROJECT_AUDIT/13_SECURITY_AUDIT.md
+63
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
# 13 Security Audit

## Overview
Security posture is development-stage. Clerk protects frontend routes, but backend API authorization is not production-safe.

## Detailed explanation
Authentication:
- Frontend Clerk integration is implemented.
- Backend does not verify Clerk JWTs.
- `x-clerk-user-id` can be forged by any client unless protected elsewhere.

Authorization:
- Backend RBAC exists but is partial.
- Organization scoping middleware exists but is not applied consistently to route queries.
- Frontend role checks are inconsistent with backend roles.

Input validation:
- Some validation exists for amounts, count, route coordinates, route slugs.
- No central validation library is used.
- No request schema validation.

Password handling:
- App does not store passwords; Clerk handles identity.

API security:
- CORS is open with default `cors()`.
- No rate limiting.
- No helmet/security headers on backend.
- No CSRF design for API.
- No audit for all sensitive actions.
- Secrets appear in `.env` files and also in generated documentation files in this workspace; these must not be committed.

Organization isolation:
- Planned but incomplete.
- Some schemas require `organizationId`, but controllers omit it.
- Many queries are not org-scoped.

OWASP issues:
- Broken access control risk: high.
- Identification/authentication failure risk: high for backend API.
- Security misconfiguration risk: medium/high.
- Injection risk: Mongoose is used, but regex search uses raw user input in route search.

## Code references
`backend/middleware/authMiddleware.js`, `backend/middleware/permissions.js`, `backend/server.js`, `frontend/proxy.ts`, controllers.

## File references
`16_Risk_Assessment.md`, `ENVIRONMENT_SETUP_COMPLETE.md`, `ENV_SETUP_VERIFICATION.md`.

## API references
All authenticated APIs that trust `x-clerk-user-id`.

## Screens
All protected screens depend on Clerk frontend protection.

## Dependencies
Clerk, Express, CORS.

## Current status
Not production-ready.

## Recommendations
Verify Clerk JWTs server-side, restrict CORS, add rate limiting and security headers, sanitize/validate input, complete org scoping, rotate exposed secrets before production.
￼PROJECT_AUDIT/14_TESTING_GUIDE.md
+59
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
# 14 Testing Guide

## Overview
Testing is minimal. Frontend lint passes. Backend test script fails because `jest` is missing.

## Detailed explanation
Observed checks:
```text
backend npm test -> sh: line 1: jest: command not found
frontend npm run lint -> passed with no lint output
frontend npm run build -> failed in sandbox with Turbopack/Leaflet CSS process EPERM
```

Backend feature tests:
1. Health: `curl http://localhost:5001/`.
2. Auth sync: `POST /api/auth/sync`.
3. Wallet: authenticated `POST /api/wallet/add`.
4. Routes: authenticated `GET /api/routes`.
5. Ticket booking: authenticated `POST /api/tickets/book`.
6. Ticket list: authenticated `GET /api/tickets/my`.
7. Scan: admin/conductor `POST /api/tickets/scan`.
8. Admin analytics: admin/conductor `GET /api/admin/analytics`.
9. Fare CRUD: price manager/org owner/super admin or old fare manager/admin endpoints under `/api/admin/routes`.
10. Organization APIs: use users with valid roles and organization IDs.

Frontend feature tests:
- Guest home.
- Clerk sign-up/sign-in.
- Registration profile sync.
- Wallet recharge.
- Route selection/map pinning.
- Ticket generation.
- Ticket list/detail.
- Admin scanning.
- Fare CRUD.

Role tests:
Use `17_ROLE_TEST_RESULTS.md` as checklist. Many roles are NOT IMPLEMENTED.

## Code references
`backend/__tests__/Organization.test.js`, `backend/package.json`, `frontend/package.json`.

## File references
`14_Testing_Strategy.md`, `backend/test-api.sh`.

## API references
All endpoints in `03_API_DOCUMENTATION.md`.

## Screens
All pages in `07_FRONTEND_PAGES.md`.

## Dependencies
Frontend lint uses ESLint. Backend test script requires Jest but dependency is absent. Test file requires `mongodb-memory-server`, also absent from `backend/package.json`.

## Current status
Automated testing is not ready for backend.

## Recommendations
Add Jest and mongodb-memory-server or update test tooling, then add integration tests for auth, org scoping, ticket flow, and fare CRUD.
￼PROJECT_AUDIT/15_SETUP_GUIDE.md
+74
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
# 15 Setup Guide

## Overview
Local setup requires Node/npm, MongoDB connection, Clerk keys, and separate backend/frontend installs.

## Detailed explanation
Prerequisites:
- Node.js/npm.
- MongoDB URI.
- Clerk development application.

Backend setup:
```bash
cd backend
npm install
npm start
```

Backend env:
- `MONGO_URI`
- `PORT`
- `FARE`
- `CLERK_SECRET_KEY`
- `FRONTEND_URL`

Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

Frontend env:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FARE`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

Maps:
Current Leaflet/OpenStreetMap implementation requires no API key.

Razorpay:
NOT IMPLEMENTED. No setup exists.

Seed/migration scripts:
- `node backend/migrations/001_backfill_default_org.js`
- `node backend/migrations/002_translate_roles.js`
- `node backend/verify-migration.js`
- `node backend/verify-organization.js`

## Code references
`backend/config.js`, `frontend/lib/api.ts`, `frontend/proxy.ts`.

## File references
`README.md`, `QUICKSTART.md`, `ENVIRONMENT_SETUP_COMPLETE.md`, `ENV_SETUP_VERIFICATION.md`.

## API references
Backend base URL defaults to `http://localhost:5001/api`. Frontend default dev URL is `http://localhost:3000`.

## Screens
Open `/` after starting frontend.

## Dependencies
See both package files.

## Current status
Documented setup exists, but backend tests and current schema/controller mismatches need attention.

## Recommendations
Use a native Linux path without spaces for Next/Turbopack, rotate any exposed dev secrets before sharing, and run migration verification before manual testing.
￼PROJECT_AUDIT/16_OPERATION_MANUAL.md
+121
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
# 16 Operation Manual

## Overview
This manual documents only operations possible in the current code. Missing workflows are marked NOT IMPLEMENTED.

## Detailed explanation
### Create an organization
UI: NOT IMPLEMENTED.
API:
1. Sign up with Clerk.
2. Ensure a backend `User` exists.
3. Call `POST /api/organizations` with `name`, `slug`, `city`.
4. The org starts `pending`; user becomes `org_owner`.
Current risk: user sync may fail before this because `organizationId` is required.

### Create admins
UI: NOT IMPLEMENTED.
Options:
- Manually update Mongo user role to old `admin` for current frontend scanner UI.
- Or use org invite API with role `conductor`, but frontend will not recognize `conductor` as admin.

### Add conductors
Partial through `POST /api/organizations/:id/invites`, then `POST /api/invites/:token/accept`.
Email sending and accept page: NOT IMPLEMENTED.

### Add drivers
NOT IMPLEMENTED.

### Add buses
NOT IMPLEMENTED. No Bus model exists.

### Assign buses
NOT IMPLEMENTED.

### Assign routes
Route creation exists, but bus/driver assignment is NOT IMPLEMENTED.

### Manage prices
1. User must have old `admin` or `fare_manager` for UI, or backend-supported price role for API.
2. Open `/admin/fares`.
3. Use Add Route/Edit/Enable/Disable/Delete.
4. Backend endpoints are under `/api/admin/routes`.
Current risk: route creation/update fare history omit required `organizationId`.

### Create ticket managers
NOT IMPLEMENTED.

### Create finance managers
NOT IMPLEMENTED except enum value and possible manual DB role.

### Create posts
NOT IMPLEMENTED.

### Use maps
1. Open `/generate`.
2. Select or type from/to stops.
3. Use map click or current location.
4. Generate ticket for an available route.

### Book tickets
1. Sign in.
2. Ensure app user exists and has balance.
3. Open `/generate`.
4. Select available route.
5. Click Generate Ticket.

### Scan tickets
1. Sign in as old `admin`.
2. Open `/admin`.
3. Start camera scanner or enter ticket ID manually.
4. Ticket becomes `USED` if active.

### Approve users
NOT IMPLEMENTED.

### Manage permissions
UI: NOT IMPLEMENTED.
API: partial through org invite role assignment.
Manual Mongo updates are currently the practical method.

### Access dashboards
- Customer: `/`, `/wallet`, `/generate`, `/tickets`.
- Legacy admin: `/admin`.
- Legacy fare manager: `/admin`, `/admin/fares`.
- Super admin/org owner/driver/finance dashboards: NOT IMPLEMENTED.

### Recover data
NOT IMPLEMENTED. No backup/restore tools.

### Reset passwords
Handled by Clerk's hosted account/auth flows, not by this app.

### Onboard a new company
Partial API only:
1. Create app user.
2. `POST /api/organizations`.
3. Manually create/assign super admin.
4. Super admin approves org with `POST /api/organizations/:id/approve`.
5. Org owner invites users.
No UI/email/persistent invite storage exists.

## Code references
Routes/controllers/pages documented throughout this folder.

## File references
`USER_FLOW_GUIDE.md`, `ADMIN_USER_SYSTEM.md`, `PHASE1_COMPLETION_REPORT.md`.

## API references
See `03_API_DOCUMENTATION.md`.

## Screens
Current usable screens are listed in `07_FRONTEND_PAGES.md`.

## Dependencies
Clerk, MongoDB, Next.js, Express.

## Current status
Passenger and legacy admin/fare flows are partially operable; enterprise operations are mostly NOT IMPLEMENTED.

## Recommendations
Build missing management UIs only after fixing data consistency and auth security.
￼PROJECT_AUDIT/17_ROLE_TEST_RESULTS.md
+49
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
# 17 Role Test Results

## Overview
Role testing was source-audited and partially command-verified. Full browser/API role testing requires working seeded users for each role.

## Detailed explanation
| Role | Exists? | Can be created? | Login works? | Dashboard exists? | Routes accessible? | Permissions working? | CRUD working? | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Super Admin | Enum yes | Manual only | Not tested | No | Org approve/suspend API | Partial | Org status only | Partial |
| Admin | Old enum yes | Manual/API sync old role not exposed in UI | Clerk works | `/admin` | Yes frontend | Yes legacy | Scanner only | Partial |
| Manager | No exact role | No | N/A | No | No | No | No | NOT IMPLEMENTED |
| Conductor | Enum yes | Manual/invite API | Not tested | No frontend role support | Backend scan allowed | Partial | Scan only | Partial |
| Driver | Enum yes | Manual only | Not tested | No | No | No | No | NOT IMPLEMENTED |
| Finance | `finance_manager` enum yes | Manual/invite API | Not tested | No | No | No finance APIs | No | NOT IMPLEMENTED |
| Passenger | old `user` and new `customer` | Intended via Clerk sync | Clerk works | Customer pages | Protected pages | Partial | Wallet/tickets | Partial |
| Organization Owner | Enum yes | Via org API | Not tested | No | Some backend APIs | Partial | Org/invites/routes APIs | Partial |
| Dispatcher | Enum yes | Manual only | Not tested | No | No | No | No | NOT IMPLEMENTED |
| Ticket Manager | No exact role | No | N/A | No | No | No | No | NOT IMPLEMENTED |
| Price Manager | Enum yes | Manual/invite API | Not tested | No frontend support | Backend fare APIs | Partial | Route CRUD | Partial |
| Guest | N/A | N/A | N/A | Home/auth | Public only | Clerk proxy redirects | No | Implemented |

Screens tested:
- Source verified all route files.
- Previous route verification showed `/sign-in` and `/sign-up` HTTP 200.
- No Playwright/browser screenshots were captured.

API tested:
- Automated endpoint testing was not completed because backend test tooling is missing and running real role tests requires seeded users.

## Code references
`backend/middleware/permissions.js`, `frontend/app/admin/page.tsx`, `frontend/app/admin/fares/page.tsx`.

## File references
`07_Role_Hierarchy.md`, `USER_FLOW_GUIDE.md`.

## API references
Role-gated APIs listed in `03_API_DOCUMENTATION.md`.

## Screens
Only customer, legacy admin, legacy fare manager screens exist.

## Dependencies
Clerk and MongoDB user records.

## Current status
Role system is not fully testable end-to-end without manual DB setup and fixes.

## Recommendations
Create seed users per role and add automated role access tests.
￼PROJECT_AUDIT/18_ROUTE_AUDIT.md
+49
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
# 18 Route Audit

## Overview
This audit covers frontend routes under `frontend/app`.

## Detailed explanation
| Route | File | Protected by Clerk proxy | Required role | Status |
|---|---|---:|---|---|
| `/` | `app/page.tsx` | No | Guest/customer | Works by source; sync risk |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | No | Guest | Implemented |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | No | Guest | Implemented |
| `/register` | `app/register/page.tsx` | Yes | Authenticated | Implemented; backend schema risk |
| `/wallet` | `app/wallet/page.tsx` | Yes | Customer | Implemented |
| `/generate` | `app/generate/page.tsx` | Yes | Customer | Implemented |
| `/tickets` | `app/tickets/page.tsx` | Yes | Customer | Implemented |
| `/tickets/[ticketId]` | `app/tickets/[ticketId]/page.tsx` | Yes | Customer | Implemented |
| `/admin` | `app/admin/page.tsx` | Yes | old `admin`/`fare_manager` in frontend | Implemented legacy |
| `/admin/fares` | `app/admin/fares/page.tsx` | Yes | old `admin`/`fare_manager` in frontend | Implemented legacy |
| `/dashboard` | `app/dashboard/page.tsx` | Yes | Authenticated | Redirects to `/` |
| `/scanner` | `app/scanner/page.tsx` | Yes | Authenticated | Redirects to `/admin` |

Missing routes:
- `/accept-invite`: NOT IMPLEMENTED.
- `/posts`: NOT IMPLEMENTED.
- `/payments`: NOT IMPLEMENTED.
- `/organizations`: NOT IMPLEMENTED.
- `/super-admin`: NOT IMPLEMENTED.
- `/drivers`, `/dispatch`, `/finance`, `/buses`: NOT IMPLEMENTED.

## Code references
`frontend/app`, `frontend/proxy.ts`.

## File references
`frontend/README.md`.

## API references
Page/API mapping is documented in `07_FRONTEND_PAGES.md`.

## Screens
No screenshots captured in this audit.

## Dependencies
Next.js App Router, Clerk middleware.

## Current status
Core routes exist and auth routes exist. Enterprise routes are NOT IMPLEMENTED.

## Recommendations
Do not add new route features until role naming and backend data consistency are fixed.
￼PROJECT_AUDIT/19_API_TEST_RESULTS.md
+56
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
# 19 API Test Results

## Overview
This file records tests attempted during the audit and source-based API status. Full endpoint execution requires a running backend, MongoDB connection, and seeded users.

## Detailed explanation
Automated command results:
- `cd backend && npm test`: FAIL. `jest: command not found`.
- `cd frontend && npm run lint`: PASS, no lint errors printed.
- `cd frontend && npm run build`: FAIL in sandbox with Turbopack internal error while processing `leaflet/dist/leaflet.css`, caused by process/port `EPERM`. Previous escalated build in this workspace had succeeded, so this is environment-sensitive.

Endpoint source-test matrix:
| Endpoint | Source status | Runtime status | Reason |
|---|---|---|---|
| `GET /` | Implemented | Not retested this turn | No backend server launched |
| `POST /api/auth/sync` | Implemented | Not executed | Requires Clerk user data; schema risk |
| `POST /api/wallet/add` | Implemented | Not executed | Requires user record/header |
| `POST /api/tickets/book` | Implemented | Not executed | Requires user, balance, DB transaction |
| `GET /api/tickets/my` | Implemented | Not executed | Requires user record/header |
| `POST /api/tickets/scan` | Implemented | Not executed | Requires admin/conductor user and ticket |
| `GET /api/admin/analytics` | Implemented | Not executed | Requires admin/conductor user |
| `GET /api/routes` | Implemented | Not executed | Requires user; seed route org risk |
| `GET /api/admin/routes` | Implemented | Not executed | Requires fare/admin role |
| `POST /api/admin/routes/create` | Implemented | Not executed | Required `organizationId` risk |
| `PUT /api/admin/routes/:id` | Implemented | Not executed | FareHistory org/action risk |
| `DELETE /api/admin/routes/:id` | Implemented | Not executed | Requires route and role |
| `PATCH /api/admin/routes/:id/toggle` | Implemented | Not executed | Requires route and role |
| `GET /api/admin/routes/fare-history` | Implemented | Not executed | Requires role |
| `POST /api/organizations` | Implemented | Not executed | Requires valid user |
| `GET /api/organizations/:id` | Implemented | Not executed | Requires org membership |
| `PATCH /api/organizations/:id` | Implemented | Not executed | AuditLog enum risk |
| `POST /api/organizations/:id/approve` | Implemented | Not executed | Requires super admin |
| `POST /api/organizations/:id/suspend` | Implemented | Not executed | Requires super admin |
| `POST /api/organizations/:id/invites` | Implemented | Not executed | In-memory token only |
| `POST /api/invites/:token/accept` | Implemented | Not executed | Requires token and user |

## Code references
`backend/routes`, `backend/controllers`, `backend/package.json`.

## File references
`backend/test-api.sh`, `backend/__tests__/Organization.test.js`.

## API references
All live endpoints listed above.

## Screens
Frontend route tests were not repeated here except lint/build command checks.

## Dependencies
Backend tests require Jest and mongodb-memory-server but they are missing from package.json.

## Current status
API test suite is not operational.

## Recommendations
Add missing test dependencies, seed fixtures, and run endpoint tests against an isolated test database.
￼PROJECT_AUDIT/20_FINAL_AUDIT_REPORT.md
+68
-0
￼
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
# 20 Final Audit Report

## Overview
Bus_automation is a promising development-stage QR bus ticketing app. Core passenger ticketing, wallet simulation, route/fare management, Clerk frontend auth, and scanner flows exist. The enterprise platform described in the planning docs is not fully implemented.

## Detailed explanation
Overall completion estimate:
- Current MVP passenger/scanner/fare demo: about 55-65% complete.
- Planned enterprise platform across all 20 implementation docs: about 25-35% complete.

Implemented features:
- Clerk frontend auth.
- Protected App Router pages.
- Wallet simulation.
- QR ticket booking/list/detail.
- QR scanner/manual validation.
- Basic scanner analytics.
- Leaflet map pinning.
- Route/fare CRUD UI/API.
- Organization schema and partial org APIs.
- Role middleware and migration scripts.

Broken or high-risk features:
- Backend auth trusts `x-clerk-user-id` instead of verifying JWTs.
- `organizationId` required fields are not supplied by several controllers.
- Frontend/backend role names are inconsistent.
- Organization update audit action is invalid for current enum.
- Backend tests cannot run because Jest is missing.
- Email invites are in-memory and not delivered.
- Open CORS and no rate limiting/security headers.

Missing features:
- Razorpay/payment gateway.
- Posts module.
- Buses/fleet/driver assignment.
- Live tracking/ETA.
- Real notifications.
- Super admin/org owner/finance/driver/dispatcher dashboards.
- Role management UI.
- Production deployment/CI.

Technical debt:
- Mixed legacy/new role model.
- Planning docs claim some things are complete that current code does not reliably support.
- Required multi-tenant schema fields were introduced before all writers were updated.
- Frontend `AppUser` type still lists only old roles.

Architecture quality:
Good separation of pages, API client, controllers, routes, models. However, security and tenancy boundaries are incomplete.

Security score:
Development: 5/10.
Production readiness: 2/10 until backend auth, org scoping, payments, secrets, CORS, and tests are fixed.

Recommended next steps:
1. Fix backend Clerk token verification.
2. Fix all required `organizationId` write paths.
3. Normalize frontend/backend role names.
4. Add missing test dependencies and integration tests.
5. Add seed/bootstrap flow for super admin/default org.
6. Only then continue with Razorpay, posts, buses, and maps expansions.

## Code references
Entire `backend/` and `frontend/` source trees excluding generated dependencies/build output.

## File references
All root planning/status markdown files and package/config files were inspected by inventory and targeted reads.
