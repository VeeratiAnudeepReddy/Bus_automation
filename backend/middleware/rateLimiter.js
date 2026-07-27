const config = require('../config');

const buckets = new Map();

function limitFor(req) {
  if (req.path.includes('/payments') || req.path.includes('/webhook')) return config.RATE_LIMIT_PAYMENTS;
  if (req.path.includes('/search')) return config.RATE_LIMIT_SEARCH;
  if (req.user?.role === 'super_admin') return config.RATE_LIMIT_AUTHENTICATED * 3;
  if (req.user) return config.RATE_LIMIT_AUTHENTICATED;
  return config.RATE_LIMIT_PUBLIC;
}

function rateLimiter(req, res, next) {
  const now = Date.now();
  const windowMs = config.RATE_LIMIT_WINDOW_MS;
  const identity = req.user?._id || req.header('x-forwarded-for') || req.ip || 'anonymous';
  const key = `${identity}:${req.path.split('/').slice(0, 4).join('/')}`;
  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  const limit = limitFor(req);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(limit - bucket.count, 0)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
  if (bucket.count > limit) {
    return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests', requestId: req.requestId } });
  }
  return next();
}

module.exports = rateLimiter;
