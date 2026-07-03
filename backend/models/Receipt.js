const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    receiptNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, default: null, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['wallet', 'razorpay', 'cash', 'adjustment'], default: 'wallet' },
    status: { type: String, enum: ['paid', 'refunded', 'void'], default: 'paid' },
    printableHtml: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    fareBreakdown: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

receiptSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('Receipt', receiptSchema);
