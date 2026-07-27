const WalletTransaction = require('../models/WalletTransaction');
const WalletLedger = require('../models/WalletLedger');
const { recordWalletTransaction } = require('../services/walletService');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

exports.recharge = async (req, res) => {
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be positive' });
    const txn = await recordWalletTransaction({
      organizationId,
      userId: req.user._id,
      type: 'recharge',
      amount,
      referenceType: 'wallet',
      referenceId: req.body.referenceId || null,
      notes: req.body.notes || 'Wallet recharge',
      idempotencyKey: req.headers['idempotency-key'] || req.body.idempotencyKey || null
    });
    res.status(201).json({ transaction: txn, balance: txn.balanceAfter });
  } catch (error) {
    console.error('Wallet recharge error:', error.message);
    res.status(500).json({ error: 'Failed to recharge wallet' });
  }
};

exports.transactions = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const query = { organizationId };
  if (req.query.userId && req.user.role === 'super_admin') query.userId = req.query.userId;
  else query.userId = req.user._id;
  const transactions = await WalletTransaction.find(query).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ transactions });
};

exports.ledger = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const query = { organizationId };
  if (req.query.userId && req.user.role === 'super_admin') query.userId = req.query.userId;
  else query.userId = req.user._id;
  const ledger = await WalletLedger.find(query).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ ledger });
};
