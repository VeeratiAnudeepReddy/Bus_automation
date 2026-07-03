# 05 — Database Changes

All changes are additive/extending existing collections except where noted. No existing
field is removed; enum values are extended, never narrowed, until a deprecation window
passes.

## New collections

**Organization** — see 07_Role_Hierarchy.md §2 for full schema.

**FareRule** (replaces flat `Route.fare` as the source of truth; `Route.fare` becomes a
cached "current effective base fare" for read-speed, still updated, but FareRule is
authoritative):
```js
{
  organizationId, routeId,
  type: enum['base','peak','weekend','festival','student','employee','coupon'],
  amountType: enum['flat','multiplier'],
  value: Number,
  activeFrom: Date, activeTo: Date | null,
  status: enum['draft','pending_approval','active','archived'],
  createdBy, approvedBy, createdAt, updatedAt
}
```

**Post**:
```js
{
  organizationId, authorId,
  title, body, attachments: [{url, type}],
  status: enum['draft','pending_approval','published','archived','scheduled'],
  publishAt: Date | null,
  pinned: Boolean,
  likeCount: Number, commentCount: Number,
  createdAt, updatedAt
}
```
`PostComment`, `PostLike` as separate collections (not embedded — comment volume on
announcement-style posts can grow unbounded, embedding would blow past Mongo's 16MB
document cap eventually).

**PaymentTransaction**:
```js
{
  organizationId, userId,
  razorpayOrderId, razorpayPaymentId, razorpaySignature,
  amount, currency: 'INR',
  purpose: enum['wallet_topup','ticket_purchase','pass_purchase'],
  status: enum['created','paid','failed','refunded','partially_refunded'],
  idempotencyKey,   // required unique index — prevents double-processing on webhook retry
  createdAt, updatedAt
}
```

**AuditLog** (generic, used by role changes, fare approvals, post moderation):
```js
{ organizationId, actorId, action, targetType, targetId, before, after, createdAt }
```

## Changes to existing collections

- `User`: + `organizationId` (indexed, nullable only for `super_admin`), role enum
  extended per 07.
- `Route`: + `organizationId` (indexed, required); unique index changes from
  `{city, fromNormalized, toNormalized}` to `{organizationId, city, fromNormalized, toNormalized}`.
- `Ticket`: + `organizationId` (denormalized at write time from the route/user, indexed).
- `FareHistory`: + `organizationId`; stays as-is otherwise, becomes a secondary audit
  trail alongside the new `AuditLog`, not replaced (it's route-fare-specific and already
  has the right shape).

## Deprecated, not deleted immediately
- `ValidationLog` — superseded conceptually by `AuditLog` for scan events, but since
  nothing currently writes to it (confirmed dead in 01), it's simply left alone; no
  migration needed, just excluded from new code paths.

## Indexes added
```
Organization: { slug: 1 } unique
FareRule: { organizationId: 1, routeId: 1, status: 1 }
Post: { organizationId: 1, status: 1, publishAt: -1 }
PaymentTransaction: { idempotencyKey: 1 } unique, { organizationId: 1, userId: 1, createdAt: -1 }
AuditLog: { organizationId: 1, createdAt: -1 }
```
