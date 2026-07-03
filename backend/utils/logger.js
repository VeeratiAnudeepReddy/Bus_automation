function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  process[level === 'error' || level === 'critical' ? 'stderr' : 'stdout'].write(`${JSON.stringify(entry)}\n`);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warning', message, meta),
  error: (message, meta) => log('error', message, meta),
  critical: (message, meta) => log('critical', message, meta),
  audit: (message, meta) => log('audit', message, meta),
  security: (message, meta) => log('security', message, meta),
  http: (message, meta) => log('http', message, meta),
  database: (message, meta) => log('database', message, meta),
  scheduler: (message, meta) => log('scheduler', message, meta),
  payment: (message, meta) => log('payments', message, meta),
  gps: (message, meta) => log('driver_gps', message, meta),
  dispatcher: (message, meta) => log('dispatcher', message, meta),
  auth: (message, meta) => log('authentication', message, meta)
};
