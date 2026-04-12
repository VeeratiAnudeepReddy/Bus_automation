const User = require('../models/User');

exports.addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const addAmount = Number(amount);

    if (!Number.isFinite(addAmount) || addAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    if (addAmount > 50000) {
      return res.status(400).json({ error: 'amount exceeds testing limit' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: addAmount } },
      { new: true, select: '_id balance role name email' }
    ).lean();

    return res.status(200).json({
      userId: user._id,
      balance: user.balance
    });
  } catch (error) {
    console.error('Add balance error:', error.message);
    return res.status(500).json({ error: 'Failed to add balance' });
  }
};
