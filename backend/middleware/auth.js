const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const config = require('../config');
const User = require('../models/User');

const clerkAuth = ClerkExpressWithAuth({
  secretKey: config.CLERK_SECRET_KEY
});

const requireClerkAuth = (req, res, next) => {
  // Fallback for clients that pass Clerk user ID directly.
  if ((!req.auth || !req.auth.userId) && req.header('x-clerk-user-id')) {
    req.auth = { ...(req.auth || {}), userId: req.header('x-clerk-user-id') };
  }

  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized: missing Clerk userId' });
  }
  return next();
};

const attachUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Unauthorized: invalid Clerk session' });
    }

    const user = await User.findOne({ clerkUserId: req.auth.userId }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found for authenticated Clerk account' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('attachUser middleware error:', error.message);
    return res.status(500).json({ error: 'Failed to load authenticated user' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: missing user context' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin access required' });
  }
  return next();
};

module.exports = {
  clerkAuth,
  requireClerkAuth,
  attachUser,
  requireAdmin
};
