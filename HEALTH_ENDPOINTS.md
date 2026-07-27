# Health Endpoints

- `GET /health`: broad health payload.
- `GET /ready`: readiness; returns 503 when MongoDB is unavailable.
- `GET /live`: process liveness.
- `GET /metrics`: Prometheus-compatible metrics.

## Payload notes (verified 2026-07-27)
- `mongo`: connection readyState.
- `redis`: always `{ ok: false, mode: "placeholder" }` until Redis is wired for SSE/jobs.
- `scheduler`: job count, `implementedJobs`, `scheduledJobs`, and `stubJobs` names.
- `payments.ok`: **true only when** `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set (does not prove live checkout works).
- `email.ok`: feature flag `FEATURE_EMAIL`.
- `maps`: reports configured provider (default `google_embed`).
