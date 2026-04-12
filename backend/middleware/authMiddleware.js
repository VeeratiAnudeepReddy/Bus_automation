const User = require('../models/User');

exports.requireAuth = async (req, res, next) => {
  try {
    const clerkUserId = req.header('x-clerk-user-id');

    if (!clerkUserId) {
      return res.status(401).json({ error: 'Missing authentication header' });
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
