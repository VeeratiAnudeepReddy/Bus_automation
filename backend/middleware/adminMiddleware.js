exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

exports.requireFareManagerOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'fare_manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin or fare manager access required' });
  }

  return next();
};
