const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    internal: { type: Boolean, default: false },
    attachments: [{ name: String, url: String, type: String }]
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    ticketNumber: { type: String, required: true, unique: true, index: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'general', index: true },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true },
    status: { type: String, enum: ['open', 'pending', 'resolved', 'closed', 'escalated'], default: 'open', index: true },
    slaDueAt: { type: Date, default: null, index: true },
    escalatedAt: { type: Date, default: null },
    attachments: [{ name: String, url: String, type: String }],
    replies: [replySchema],
    history: [
      {
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: String,
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

supportTicketSchema.index({ organizationId: 1, status: 1, priority: 1, createdAt: -1 });
supportTicketSchema.index({ organizationId: 1, requesterId: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
