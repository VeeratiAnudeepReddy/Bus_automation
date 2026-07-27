# Conductor API Reference

- `GET /conductors`: list/search/filter conductor profiles.
- `POST /conductors`: create conductor profile.
- `PATCH /conductors/:id`: update shift, assignments, collections, documents, and notes.
- `DELETE /conductors/:id`: delete conductor profile.
- `POST /conductors/:id/assign-bus`: assign conductor to bus.

The `/conductors` UI includes a manual scanner path that reuses the existing ticket validation API.
