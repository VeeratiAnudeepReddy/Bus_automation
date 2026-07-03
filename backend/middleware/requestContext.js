const crypto = require('crypto');
const logger = require('../utils/logger');
const metrics = require('../services/metricsService');

function requestContext(req, res, next) {
  const startedAt = Date.now();
  req.requestId = req.header('x-request-id') || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    const latencyMs = Date.now() - startedAt;
    metrics.observeRequest(latencyMs, res.statusCode);
    logger.http('request', {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      latencyMs,
      user: req.user?._id || null,
      organization: req.user?.organizationId || null,
      ip: req.ip
    });
  });

  next();
}

module.exports = requestContext;
