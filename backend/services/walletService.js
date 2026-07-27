const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const WalletLedger = require('../models/WalletLedger');
const { recordFinancialEntry } = require('./financialLedgerService');

async function recordWalletTransaction({
  organizationId,
  userId,
  type,
  amount,
  referenceType = null,
  referenceId = null,
  notes = null,
  idempotencyKey = null,
  session = null
}) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new Error('INVALID_WALLET_AMOUNT');
  }

  const existing = idempotencyKey
    ? await WalletTransaction.findOne({ organizationId, idempotencyKey }).session(session)
    : null;
  if (existing) return existing;

  const user = await User.findById(userId).select('balance').session(session);
  if (!user) throw new Error('WALLET_USER_NOT_FOUND');

  const normalizedDebitTypes = ['debit', 'transfer', 'lock', 'booking_debit'];
  const delta = normalizedDebitTypes.includes(type) ? -numericAmount : numericAmount;
  if (user.balance + delta < 0) throw new Error('INSUFFICIENT_BALANCE');

  const balanceBefore = user.balance;
  user.balance = Math.round((user.balance + delta) * 100) / 100;
  await user.save({ session });

  const [transaction] = await WalletTransaction.create(
    [{
      organizationId,
      userId,
      type,
      amount: numericAmount,
      balanceBefore,
      balanceAfter: user.balance,
      referenceType,
      referenceId,
      notes,
      idempotencyKey
    }],
    { session }
  );

  await WalletLedger.create(
    [{
      organizationId,
      userId,
      transactionId: transaction._id,
      openingBalance: balanceBefore,
      debit: delta < 0 ? numericAmount : 0,
      credit: delta >= 0 ? numericAmount : 0,
      closingBalance: user.balance,
      balance: user.balance,
      actorId: userId,
      referenceId,
      reason: notes || type,
      description: notes || referenceType || type
    }],
    { session }
  );

  await recordFinancialEntry({
    organizationId,
    userId,
    walletTransactionId: transaction._id,
    category: 'wallet',
    direction: delta < 0 ? 'debit' : 'credit',
    amount: numericAmount,
    idempotencyKey: `wallet-ledger:${transaction._id}`,
    reason: notes || type,
    metadata: { referenceType, referenceId, type },
    session
  });

  return transaction;
}

module.exports = { recordWalletTransaction };
