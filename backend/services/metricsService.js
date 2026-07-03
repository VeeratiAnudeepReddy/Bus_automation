const metrics = {
  httpRequests: 0,
  httpErrors: 0,
  gpsUpdates: 0,
  dispatcherEvents: 0,
  notificationEvents: 0,
  latencyMs: [],
  startedAt: Date.now()
};

function observeRequest(latency, statusCode) {
  metrics.httpRequests += 1;
  if (statusCode >= 400) metrics.httpErrors += 1;
  metrics.latencyMs.push(latency);
  if (metrics.latencyMs.length > 1000) metrics.latencyMs.shift();
}

function increment(name, by = 1) {
  metrics[name] = (metrics[name] || 0) + by;
}

function snapshot() {
  const latency = metrics.latencyMs;
  const avgLatencyMs = latency.length ? latency.reduce((sum, item) => sum + item, 0) / latency.length : 0;
  return {
    ...metrics,
    avgLatencyMs,
    uptimeSeconds: Math.round((Date.now() - metrics.startedAt) / 1000),
    memory: process.memoryUsage()
  };
}

function prometheus() {
  const current = snapshot();
  return [
    '# HELP busqr_http_requests_total Total HTTP requests',
    '# TYPE busqr_http_requests_total counter',
    `busqr_http_requests_total ${current.httpRequests}`,
    '# HELP busqr_http_errors_total Total HTTP error responses',
    '# TYPE busqr_http_errors_total counter',
    `busqr_http_errors_total ${current.httpErrors}`,
    '# HELP busqr_http_latency_average_ms Average HTTP latency in milliseconds',
    '# TYPE busqr_http_latency_average_ms gauge',
    `busqr_http_latency_average_ms ${current.avgLatencyMs.toFixed(2)}`,
    '# HELP busqr_gps_updates_total Total GPS updates',
    '# TYPE busqr_gps_updates_total counter',
    `busqr_gps_updates_total ${current.gpsUpdates}`,
    '# HELP busqr_process_uptime_seconds Process uptime',
    '# TYPE busqr_process_uptime_seconds gauge',
    `busqr_process_uptime_seconds ${current.uptimeSeconds}`,
    '# HELP busqr_memory_heap_used_bytes Heap used',
    '# TYPE busqr_memory_heap_used_bytes gauge',
    `busqr_memory_heap_used_bytes ${current.memory.heapUsed}`
  ].join('\n');
}

module.exports = { observeRequest, increment, snapshot, prometheus };
