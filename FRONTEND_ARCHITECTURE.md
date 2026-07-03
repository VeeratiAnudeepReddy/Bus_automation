# Frontend Architecture

## Current Frontend Shape
- `AuthGate` owns authentication routing.
- `PageShell` provides enterprise shell chrome.
- Production customer routes now use `CustomerExperience.tsx`.
- Operations, fleet, driver, conductor, organization, and user-management pages remain route-specific or module-specific.
- Generic enterprise templates remain only where dedicated restoration has not yet been completed.

## Customer Module
`CustomerExperience.tsx` centralizes restored consumer UI for:
- Dashboard
- Booking
- Bookings
- Booking detail
- Wallet
- Notifications
- Search
- Settings
- Profile
- Support

## API Usage
Customer pages consume existing frontend API methods only:
- `getMyTickets`
- `getRoutes`
- `createBooking`
- `listBookings`
- `getBooking`
- `getNotifications`
- `listPosts`
- `listSupportTickets`
- `createSupportTicket`
- `globalSearch`
- `listPayments`
- `getWalletTransactions`
- `createPaymentOrder`
- `verifyPayment`

## Boundaries
No backend, auth, payment, Razorpay service, realtime, GPS, dispatcher, trip engine, or notification backend changes were made during this restoration.
