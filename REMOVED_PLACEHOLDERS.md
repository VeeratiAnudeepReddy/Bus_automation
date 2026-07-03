# Removed Placeholders

## Removed From Production Customer Routes
- `/customer` no longer uses `RoleDashboard`.
- `/booking` no longer uses `EnterpriseActionPage`.
- `/bookings` no longer uses `EnterpriseDataPage`.
- `/bookings/[id]` no longer uses `EnterpriseDetailPage`.
- `/wallet`, `/wallet/history`, `/wallet/recharge`, and `/wallet/transactions` no longer use generic wallet templates.
- `/notifications` no longer uses `EnterpriseDataPage`.
- `/search`, `/settings`, `/profile`, and `/support` no longer use generic utility/collaboration templates.

## Still Present Outside Customer Routes
Generated templates remain for finance, payments, refunds, pricing, reports, audit, super-admin, and some admin coupon/pricing pages. These are documented in `UI_AUDIT.md` as high-priority restoration work.
