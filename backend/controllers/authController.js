const User = require('../models/User');

exports.syncClerkUser = async (req, res) => {
  try {
    const { clerkUserId, name, email, phone } = req.body;

    if (!clerkUserId || !email) {
      return res.status(400).json({ error: 'clerkUserId and email are required' });
    }

    let user = await User.findOne({ clerkUserId }).lean();

    if (!user) {
      user = await User.create({
        clerkUserId,
        name: (name || 'Bus User').trim(),
        email: email.toLowerCase().trim(),
        phone: (phone || 'N/A').trim(),
        role: 'user',
        balance: 1000
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
      clerkUserId: user.clerkUserId
    });
  } catch (error) {
    console.error('Sync user error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    return res.status(500).json({ error: 'Failed to sync user' });
  }
};
