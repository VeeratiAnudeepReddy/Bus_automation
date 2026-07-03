const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, default: null, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    gstNumber: { type: String, default: null },
    passengerDetails: mongoose.Schema.Types.Mixed,
    organizationDetails: mongoose.Schema.Types.Mixed,
    fareBreakdown: mongoose.Schema.Types.Mixed,
    couponBreakdown: mongoose.Schema.Types.Mixed,
    walletContribution: { type: Number, default: 0 },
    razorpayPaymentId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    lineItems: [{ label: String, quantity: Number, amount: Number }],
    status: { type: String, enum: ['issued', 'void'], default: 'issued' }
  },
  { timestamps: true }
);

invoiceSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
