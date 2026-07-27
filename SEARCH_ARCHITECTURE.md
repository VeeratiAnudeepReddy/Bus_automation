# Search Architecture

Global search endpoint:
`GET /api/search?q=...`

Search groups:
- users
- routes
- buses
- tickets
- payments
- posts
- support tickets
- schedules

Frontend `/search` calls the backend when at least two characters are entered and groups results by collection.
