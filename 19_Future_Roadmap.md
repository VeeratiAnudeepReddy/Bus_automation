# 19 — Future Roadmap (explicitly reserved, not built in this pass)

Collecting every "reserved" item flagged across 07–13 in one place so it's a visible
backlog rather than scattered footnotes.

## Fleet & Operations
- Bus model (registration, capacity, maintenance records, insurance/permit expiry)
- Driver model (documents, license expiry, assignment history)
- Trip/Schedule model (bus + driver + route + time → a bookable trip instance)
- Depot Manager / Regional Admin / Fleet Manager / Operations Manager / Dispatcher roles
  activate once the above models exist (schema slots already reserved in 07)
- Conflict detection (double-booking a bus/driver into overlapping trips)

## Live tracking
- Driver-side location ping endpoint
- Passenger-side live map (WebSocket or polling)
- ETA becomes live-computed rather than static Distance Matrix estimate

## Notifications
- SMS/WhatsApp provider integration (pending your choice, 02 #14)
- Push notifications tied to trip status (depends on Trip model existing)

## Platform-level
- Multi-tenant billing/subscription (how does the platform charge each Organization —
  genuinely undecided, needs a business decision before any technical design)
- Cross-org multi-membership for users (a driver working for two operators, e.g.)
- API versioning, once there's a second real consumer of the API beyond this frontend

## Compliance
- Formal data retention policy, DPDP Act alignment (02 #15)
- GST/tax invoicing depth (02 #13) beyond basic receipt generation

Each of these, when prioritized, should get its own numbered doc following the same
format as 08–12 — feature overview, DB changes, backend/frontend changes, edge cases —
rather than being retrofitted into an existing doc.
