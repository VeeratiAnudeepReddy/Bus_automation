# UI Restoration Report

## Restored This Pass
- Replaced the generated customer dashboard with a dedicated consumer dashboard.
- Replaced the generated booking form with a route search, available-bus cards, seat layout, fare breakup, coupon, wallet usage, and Google Maps embed.
- Replaced generic bookings list/detail pages with customer trip/ticket views.
- Replaced the static wallet page with a wallet summary, Razorpay checkout entry, payment/refund summary, transaction search, and statement action.
- Replaced generic notifications with customer travel alerts.
- Replaced generic global search with instant backend-backed search.
- Replaced generic settings/profile/support customer pages with dedicated customer surfaces.
- Repointed wallet subroutes to the restored wallet experience.

## Backend/API Boundary
No backend APIs, authentication code, authorization code, payment services, Razorpay backend logic, realtime, dispatcher, trip, GPS, or notification backend logic were modified.

## Remaining Restoration Queue
- Finance, payments, refunds, pricing, reports, super-admin, and fleet dashboards still use generated templates or placeholder dashboards.
- PDF invoice rendering is not available without adding a frontend/backend PDF renderer.
- Weather, traffic, and route-polyline rendering depend on provider/backend data not currently exposed to the frontend.
