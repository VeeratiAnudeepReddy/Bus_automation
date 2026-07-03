# GPS Tracking

## Model
`backend/models/GPSLocation.js`

## APIs
- `POST /api/trips/:id/location`
- `GET /api/trips/:id/location`
- `GET /api/trips/:id/history`

## Stored Data
Latitude, longitude, accuracy, speed, heading, distance travelled, remaining distance, ETA, timestamp, and device information.

## Frontend
`/track/[tripId]` displays a Google Maps embed using the latest location and shows ETA, delay, remaining distance, and trip events.
