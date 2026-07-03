# Health Endpoints

- `GET /health`: broad health payload.
- `GET /ready`: readiness; returns 503 when MongoDB is unavailable.
- `GET /live`: process liveness.
- `GET /metrics`: Prometheus-compatible metrics.

Health checks report MongoDB, Redis placeholder, memory, uptime, scheduler, payment provider, email provider, maps provider, and disk placeholder.
