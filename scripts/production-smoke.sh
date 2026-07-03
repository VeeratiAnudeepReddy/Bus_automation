#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:5001}"
curl -fsS "$BASE_URL/health"
curl -fsS "$BASE_URL/ready" || true
curl -fsS "$BASE_URL/metrics" | head
