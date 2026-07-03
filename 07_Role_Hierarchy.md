# 07 — Organization Model & Role Hierarchy

## 0. Why this comes first

Every other module in the plan (pricing, posts, maps/routing, Razorpay) needs to know
**"which organization does this record belong to"** and **"what can this user do inside
that organization."** Retrofitting tenancy after those modules exist means touching them
twice. So this is the foundation, and nothing else gets built until this lands.

## 1. Current state vs. target state

| | Today | Target |
|---|---|---|
| Tenancy | Single implicit tenant (whole DB = one operator) | Multi-tenant: many bus operator companies on one platform |
| Roles | `user`, `admin`, `fare_manager` (flat, no scoping) | 10+ hierarchical roles, scoped to an org |
| Role assignment | None — no endpoint exists; must be set by hand in Mongo | Self-service org onboarding + in-app invite/assign flow |
| Route uniqueness | `{ city, fromNormalized, toNormalized }` | `{ organizationId, city, fromNormalized, toNormalized }` |
| Auth | Client-supplied header, unverified (see security note below) | Verified Clerk session → resolves to `(user, organizationId, role)` |

**Note carried over from the audit:** auth verification itself (real Clerk token
validation replacing the trusted header) is tracked as its own task later in the plan,
per your instruction to note-and-defer. This doc assumes that fix lands before
production use, since a spoofable identity makes org-scoping meaningless.

## 2. New concept: Organization

A bus operator company. Every operational record (routes, tickets, fares, buses when
they exist, posts) belongs to exactly one Organization.

```js
// models/Organization.js
{
  name: String,               // "Sri Balaji Travels"
  slug: String,                // unique, url-safe, used in onboarding links
  city: String,                 // primary city of operation (Hyderabad default)
  status: enum ['pending', 'active', 'suspended'],
  ownerUserId: ObjectId(User),  // the person who onboarded it
  billingContact: { name, email, phone },
  createdAt, updatedAt
}
```

`User` gains:
```js
organizationId: ObjectId(Organization) | null   // null only for platform Super Admin
```

A user belongs to **one** organization for v1 (no cross-org multi-membership yet — that's
a fast-follow, not a blocker; flagging it explicitly so it's a deliberate choice, not an
oversight).

## 3. Role hierarchy

Ordered highest → lowest authority. Each role's permissions are additive over the one
below it **unless marked "lateral"** (siblings with different, non-overlapping scopes
rather than a strict ladder).

| # | Role | Scope | Key permissions |
|---|---|---|---|
| 1 | **Super Admin** | Platform-wide, cross-org | Approve/suspend organizations, impersonate for support, view platform analytics, no org-level data access by default (must explicitly "enter" an org for support) |
| 2 | **Organization Owner** | Own org | Everything below within their org; billing; can delete the org; assigns Regional Admins |
| 3 | **Regional Admin** | Subset of org (region/depot group) | Manage depots and staff within assigned regions; cannot touch billing |
| 4 | **Depot Manager** | One depot | Manage buses/drivers/conductors at that depot; approve trip schedules |
| 5 | **Fleet Manager** | Org or depot-scoped | Bus CRUD, maintenance records, insurance/permit expiry tracking |
| 6 | **Ticket Price Manager** *(exists today as `fare_manager` — renamed/extended)* | Org-scoped | Route/fare CRUD, pricing rules, approve price changes above threshold |
| 7 | **Finance Manager** *(lateral to Fleet/Price Manager)* | Org-scoped | Read-only on revenue, refunds, payment reconciliation, exports |
| 8 | **Operations Manager** | Org or depot-scoped | Schedules, dispatch, trip assignment |
| 9 | **Dispatcher / Scheduler** *(lateral pair)* | Depot-scoped | Day-to-day trip/driver assignment, no pricing or bus CRUD |
| 10 | **Driver** | Self | View own trips/schedule, mark trip start/end |
| 11 | **Conductor** *(this is today's `admin` scanner role — renamed)* | Self / assigned trip | Scan tickets, validate, view own scan history |
| 12 | **Support** | Org-scoped, read-mostly | View tickets/users for customer support, cannot modify pricing or finances |
| 13 | **Customer** *(today's `user`)* | Self | Register, recharge, book tickets, view own history |
| 14 | **Guest** | None | Public routes/pricing browsing only, no account |

**Assumption flagged for confirmation:** roles 4–9 (Depot Manager through
Dispatcher/Scheduler) require concepts — Depot, Bus, Driver, Trip, Schedule — that don't
exist in the schema yet and aren't in your four mandatory features (pricing, posts, maps,
Razorpay). I'm designing the *permission slots* for them now so the hierarchy doesn't need
rework later, but I won't build Depot/Bus/Trip CRUD unless you confirm that's actually
in scope — otherwise this becomes unbounded. Treat rows 4, 5, 8, 9 as **reserved, not
implemented** in the first pass.

## 4. What actually gets built in this pass

Given your four mandatory features, the roles that need real, working permission checks
now are:

- Super Admin
- Organization Owner
- Ticket Price Manager (rename/extend `fare_manager`)
- Finance Manager (new, read-only, needed once Razorpay lands)
- Support (new, needed for the Post module's moderation)
- Conductor (rename `admin` → clarify it's a scanner role, not org admin — today's
  naming is actively confusing: `requireAdmin` currently gates *ticket scanning*, not
  organization administration)
- Customer (rename `user`)

Depot Manager / Regional Admin / Fleet Manager / Operations / Dispatcher stay as reserved
enum values with no routes yet, so the schema doesn't need another migration when you do
want them.

## 5. Schema changes

```js
// User.js — additions
organizationId: { type: ObjectId, ref: 'Organization', default: null, index: true },
role: {
  type: String,
  enum: ['super_admin', 'org_owner', 'regional_admin', 'depot_manager', 'fleet_manager',
         'price_manager', 'finance_manager', 'operations_manager', 'dispatcher',
         'driver', 'conductor', 'support', 'customer'],
  default: 'customer'
}
```

```js
// Route.js — unique index becomes:
routeSchema.index(
  { organizationId: 1, city: 1, fromNormalized: 1, toNormalized: 1 },
  { unique: true }
);
```
`organizationId` added as required field, indexed.

`Ticket`, `FareHistory` — add `organizationId` (denormalized from the route/user at write
time, so reports don't need joins).

## 6. Onboarding flow (self-service)

1. `POST /api/organizations` (any authenticated Clerk user, no existing org) → creates
   Organization with `status: 'pending'`, sets caller as `org_owner`.
2. Super Admin approves → `status: 'active'`. **Not auto-active** — this is deliberate;
   an unmoderated self-service flow that goes straight to a live operator (able to set
   fares and collect ₹ via Razorpay later) is a fraud vector worth a manual gate. Flag if
   you'd rather it be instant-active for launch speed.
3. Org Owner invites staff: `POST /api/organizations/:id/invites` (email + role) →
   invitee accepts via Clerk sign-up, gets bound to that org + role.

## 7. Middleware design

Replace `requireAdmin` / `requireFareManagerOrAdmin` with a single composable check:

```js
requireRole(...allowedRoles)       // role must be in the set
requireOrgScope()                  // req.user.organizationId must match the resource's orgId
requireSuperAdmin()                // bypasses org scoping entirely
```

Every org-scoped route handler queries with `{ organizationId: req.user.organizationId, ...}`
— never trusts an `organizationId` passed in the request body/params for write operations.

## 8. Open questions before I generate the migration script

1. Confirm: is instant-active org signup acceptable for launch, or does Super Admin
   approval gate every new operator (my default assumption above)?
2. Confirm rows 4/5/8/9 (Depot/Fleet/Ops/Dispatcher) are reserved-only for this pass —
   not built now.
3. Existing data: current DB has no `organizationId` anywhere. For migration, do you want
   a single "default" Organization created and all existing Users/Routes/Tickets backfilled
   into it, or is the current dataset disposable (fresh start)?
