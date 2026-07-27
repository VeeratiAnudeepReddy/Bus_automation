# 06 — API Changes

## Backward compatibility shim

`requireAdmin` and `requireFareManagerOrAdmin` stay exported with identical signatures
from `middleware/adminMiddleware.js` so nothing that imports them breaks:

```js
// adminMiddleware.js — becomes a thin wrapper, not deleted
exports.requireAdmin = requireRole('conductor', 'org_owner', 'super_admin');
exports.requireFareManagerOrAdmin = requireRole('price_manager', 'org_owner', 'super_admin');
```

## New endpoints

### Organizations
```
POST   /api/organizations                     any authenticated user, no existing org
GET    /api/organizations/:id                  org members only
PATCH  /api/organizations/:id                  org_owner
POST   /api/organizations/:id/approve          super_admin
POST   /api/organizations/:id/invites          org_owner
POST   /api/invites/:token/accept               invited user (post Clerk signup)
```

### Pricing (Ticket Price Manager module)
```
GET    /api/pricing/routes/:routeId/rules       org members
POST   /api/pricing/routes/:routeId/rules       price_manager | org_owner
PATCH  /api/pricing/rules/:id                   price_manager | org_owner
POST   /api/pricing/rules/:id/approve           org_owner (maker-checker if above threshold)
POST   /api/pricing/rules/:id/rollback          price_manager | org_owner
GET    /api/pricing/routes/:routeId/history      org members
```

### Posts
```
GET    /api/posts                                org members (filtered by status+role)
POST   /api/posts                                support | org_owner | (others per Q5 answer)
PATCH  /api/posts/:id                            author | org_owner
POST   /api/posts/:id/publish                    org_owner (or per approval workflow)
POST   /api/posts/:id/comments                   any org member
POST   /api/posts/:id/like                       any org member
```

### Maps/Routing
```
GET    /api/routes/search?from=&to=&city=        public/guest allowed
GET    /api/routes/:id/eta                        org members
POST   /api/admin/routes/:id/stops                price_manager | org_owner (extends existing route CRUD, not new module)
```

### Payments
```
POST   /api/payments/orders                       authenticated user — creates Razorpay order
POST   /api/payments/webhook                       Razorpay only, signature-verified, no user auth
GET    /api/payments/transactions                  self, or finance_manager for org-wide
POST   /api/payments/:id/refund                    finance_manager | org_owner
```

## Existing endpoints — behavior changes, same contract

- `/api/auth/sync`: response gains `organizationId` field; request unchanged.
- `/api/tickets/book`, `/api/tickets/my`, `/api/tickets/scan`: internally now resolve
  `req.organizationId` and filter/write with it; **request/response JSON shape
  unchanged** — this is purely server-side scoping, no frontend change required for
  these three.
- `/api/admin/routes/*`: same shape, now org-scoped server-side; a `fare_manager` from
  Org A can no longer see or edit Org B's routes (today, with no scoping, this is
  actually a live cross-tenant data leak risk once a second org is created — this fix is
  load-bearing, not cosmetic).
