# Bus API Reference

All endpoints are mounted under `/api` and require authentication.

- `GET /buses`: list buses with search/status/pagination.
- `GET /buses/:id`: fetch bus and audit history.
- `POST /buses`: create bus.
- `PATCH /buses/:id`: update bus.
- `DELETE /buses/:id`: soft-delete/retire bus.
- `PATCH /buses/:id/status`: update operational status.
- `PATCH /buses/:id/maintenance`: update maintenance/service fields.
- `GET /buses/:id/history`: audit history.
- `GET /buses/export`: CSV export.
- `POST /buses/import`: JSON import.

Duplicate `busNumber` and `registrationNumber` are prevented per organization.
