const config = require('../config');

function apiVersion(req, res, next) {
  res.setHeader('X-API-Version', config.API_VERSION);
  if (req.originalUrl.startsWith('/api/') && !req.originalUrl.startsWith(`/api/${config.API_VERSION}/`)) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', 'Sat, 31 Dec 2028 23:59:59 GMT');
  }
  next();
}

module.exports = apiVersion;
