const { recordWalletTransaction } = require('../services/walletService');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

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

    const organizationId = await resolveOrganizationId(req.user);
    const transaction = await recordWalletTransaction({
      organizationId,
      userId: req.user._id,
      type: 'recharge',
      amount: addAmount,
      referenceType: 'wallet',
      referenceId: 'legacy-add',
      notes: 'Wallet top-up'
    });

    return res.status(200).json({
      userId: req.user._id,
      balance: transaction.balanceAfter,
      transaction
    });
  } catch (error) {
    console.error('Add balance error:', error.message);
    return res.status(500).json({ error: 'Failed to add balance' });
  }
};
