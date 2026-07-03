const User = require('../models/User');
const { requireClerkAuth } = require('./clerkJwt');

const loadUser = async (req, res, next) => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ error: 'Missing authenticated Clerk user' });
    }

    const user = await User.findOne({ clerkUserId }).lean();
    if (!user) {
      return res.status(401).json({ error: 'User not found for this Clerk account' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.requireAuth = [requireClerkAuth, loadUser];
exports.loadUser = loadUser;
