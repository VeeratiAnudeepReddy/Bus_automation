const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    attachments: [{ name: String, url: String, type: String }],
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    visibility: {
      type: String,
      enum: ['public', 'organization', 'roles', 'staff'],
      default: 'organization',
      index: true
    },
    roles: [{ type: String }],
    pinned: { type: Boolean, default: false, index: true },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true },
    category: { type: String, default: 'announcement', trim: true, index: true },
    tags: [{ type: String, trim: true }],
    attachments: [{ name: String, url: String, type: String }],
    readReceipts: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
    publishAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, default: null, index: true },
    status: { type: String, enum: ['draft', 'scheduled', 'published', 'archived'], default: 'published', index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    deletedAt: { type: Date, default: null },
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

postSchema.index({ organizationId: 1, pinned: -1, publishAt: -1 });
postSchema.index({ organizationId: 1, category: 1, status: 1 });
postSchema.index({ organizationId: 1, tags: 1 });

module.exports = mongoose.model('Post', postSchema);
