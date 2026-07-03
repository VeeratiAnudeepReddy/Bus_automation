const config = require('../config');
const logger = require('../utils/logger');

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:* https:; img-src 'self' data: https:; frame-src https://www.google.com https://maps.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'");
  next();
}

function corsOptions(req, callback) {
  const origin = req.header('Origin');
  if (!origin || config.CORS_ORIGINS.includes(origin) || config.NODE_ENV !== 'production') {
    return callback(null, { origin: origin || true, credentials: true });
  }
  logger.security('cors_rejected', { origin, route: req.originalUrl });
  return callback(null, { origin: false });
}

function cleanObject(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(cleanObject);
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
    } else {
      value[key] = cleanObject(value[key]);
    }
  }
  return value;
}

function sanitizeRequest(req, res, next) {
  cleanObject(req.body);
  cleanObject(req.query);
  cleanObject(req.params);
  next();
}

module.exports = { securityHeaders, corsOptions, sanitizeRequest };
