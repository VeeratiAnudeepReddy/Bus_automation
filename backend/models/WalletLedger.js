const mongoose = require('mongoose');

const walletLedgerSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', required: true, index: true },
    openingBalance: { type: Number, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    closingBalance: { type: Number, required: true },
    balance: { type: Number, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referenceId: { type: String, default: null, index: true },
    reason: { type: String, default: null },
    description: { type: String, default: null }
  },
  { timestamps: true }
);

walletLedgerSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
walletLedgerSchema.index({ organizationId: 1, transactionId: 1 }, { unique: true });

module.exports = mongoose.model('WalletLedger', walletLedgerSchema);
