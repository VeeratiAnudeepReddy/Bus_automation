# Metrics Guide

`backend/services/metricsService.js` tracks:
- HTTP requests
- HTTP errors
- average latency
- GPS updates
- uptime
- memory heap

Prometheus format is exposed at `/metrics`.
