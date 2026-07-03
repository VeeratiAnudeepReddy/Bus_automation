# Pricing Engine

## Implemented
- `FareRule` supports flat fares, percentage adjustments, fixed discounts, and surge multipliers.
- Rules are organization-scoped and can target route, passenger type, effective dates, priority, min/max fare, status, and approval status.
- `FareVersion` records snapshots for create/update/publish events.
- `PriceApproval` records requested and approved pricing decisions.
- `Coupon` supports flat/percentage discounts, max discount, route/passenger constraints, usage limits, and expiry.
- `/pricing/simulate` previews dynamic fares and coupon discounts.

## Compatibility
If no published approved rule applies, booking continues to use the route fare or default fare.
