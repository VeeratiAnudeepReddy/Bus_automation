# Restored Pages

| Route | Restoration |
|---|---|
| `/customer` | Consumer dashboard with hero, wallet, upcoming trip, favorites, offers, maps, notifications, and real backend statistics. |
| `/booking` | Airline-style bus booking search with bus cards, seat layout, route map, fare breakup, coupon, wallet usage, and payment handoff. |
| `/bookings` | Customer bookings list backed by booking APIs. |
| `/bookings/[id]` | Customer booking detail with tickets, QR shortcuts, fare summary, and map. |
| `/wallet` | Wallet dashboard with Razorpay recharge, payments, refunds, transactions, search, and statement action. |
| `/wallet/history` | Routed to restored wallet experience. |
| `/wallet/recharge` | Routed to restored wallet experience. |
| `/wallet/transactions` | Routed to restored wallet experience. |
| `/notifications` | Travel alert notification center backed by notifications API. |
| `/search` | Backend-backed intelligent global search. |
| `/settings` | Restored settings surface with theme, notifications, security, API keys, GST, branding, roles, permissions, and danger-zone sections. |
| `/profile` | Customer travel profile page backed by authenticated user context. |
| `/support` | Customer support center with create-ticket form and ticket list. |

## Main Implementation File
`frontend/components/CustomerExperience.tsx`
