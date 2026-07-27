# 10 — Maps Module

## Scope note
Per the reserved-role principle in 07: live GPS bus tracking needs a Bus/Trip/Driver
data model that doesn't exist yet and isn't one of your four mandatory features. This
doc covers what's buildable now — static route visualization + ETA estimate — and
explicitly reserves live tracking as a documented future phase rather than
half-building it. **Open question 02 #8/#9 block finalizing this** — proceeding with
Google Maps as the default assumption (frontend already has no maps SDK integrated yet,
so this is a clean pick either way) since it's the more common choice for Indian
consumer apps, but this is reversible with no sunk cost if you'd rather use Mapbox.

## Existing integration point
`Route.fromCoords`/`toCoords` already exist (lat/lng pairs) — this module consumes
them, doesn't restructure them.

## Backend changes
- `GET /api/routes/:id/eta` — calls Google Distance Matrix API server-side (never
  exposes the API key to the client), caches result for a short TTL (e.g. 15 min) in
  Mongo or the new job-runner's Redis if that's adopted, since Distance Matrix calls
  are billed per request and route distances don't change minute-to-minute.
- `GET /api/routes/search` — reverse-geocoding-assisted search, letting a user type a
  place name and match against `fromNormalized`/`toNormalized` with fuzzy matching
  (Mongo text index) rather than requiring exact stop names.

## Frontend changes
- Route detail view gains an embedded static map (Google Maps JS SDK) rendering
  `fromCoords`→`toCoords` as a polyline, replacing the current implicit
  "no visualization" state — genuinely new UI, no existing map component to extend.
- Stop management UI (for price_manager/org_owner creating routes) gains a map-click
  picker for coords instead of manual lat/lng entry.

## Security/perf
- API key restricted by HTTP referrer + IP in Google Cloud Console; billing alert set
  at a sane threshold.
- Client-side map render uses a separate, restricted "browser key"; server-side ETA
  calls use a separate "server key" — never the same credential in both places.

## Future phase (explicitly out of scope now)
Live GPS requires: a Trip model, a driver-side location-ping endpoint, a WebSocket or
polling layer for passenger-side live position, and battery/accuracy tradeoffs on the
driver's phone. Sizing this properly needs its own doc once Bus/Trip/Driver exist —
noted in 19_Future_Roadmap.md, not designed here to avoid half-committing to an
under-specified real-time system.
