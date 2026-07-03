const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const canManagePosts = (user) => ['super_admin', 'org_owner', 'org_admin', 'support'].includes(user.role);
const canReadPost = (post, user) => {
  if (user.role === 'super_admin') return true;
  if (String(post.organizationId) !== String(user.organizationId)) return false;
  if (post.visibility === 'public' || post.visibility === 'organization') return true;
  if (post.visibility === 'staff') return user.role !== 'customer' && user.role !== 'user';
  if (post.visibility === 'roles') return post.roles.includes(user.role);
  return false;
};

const pagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

exports.listPosts = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const { page, limit, skip } = pagination(req.query);
  const query = { organizationId, deletedAt: null };
  if (req.query.category) query.category = req.query.category;
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    const search = new RegExp(String(req.query.search).trim(), 'i');
    query.$or = [{ title: search }, { body: search }, { tags: search }];
  }

  const [posts, total] = await Promise.all([
    Post.find(query).sort({ pinned: -1, publishAt: -1 }).skip(skip).limit(limit).populate('authorId', 'name email role').lean(),
    Post.countDocuments(query)
  ]);
  const visible = posts.filter((post) => canReadPost(post, req.user));
  res.json({ posts: visible, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
};

exports.getPost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOne({ _id: req.params.id, organizationId, deletedAt: null }).populate('authorId comments.authorId', 'name email role').lean();
  if (!post || !canReadPost(post, req.user)) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
};

exports.createPost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManagePosts(req.user)) return res.status(403).json({ error: 'Not authorized to create posts' });
  if (!req.body.title || !req.body.body) return res.status(400).json({ error: 'title and body are required' });
  const post = await Post.create({
    organizationId,
    authorId: req.user._id,
    title: req.body.title,
    body: req.body.body,
    visibility: req.body.visibility || 'organization',
    roles: req.body.roles || [],
    pinned: Boolean(req.body.pinned),
    priority: req.body.priority || 'normal',
    category: req.body.category || 'announcement',
    tags: req.body.tags || [],
    attachments: req.body.attachments || [],
    publishAt: req.body.publishAt || new Date(),
    expiresAt: req.body.expiresAt || null,
    status: req.body.status || 'published',
    history: [{ actorId: req.user._id, action: 'created', after: req.body }]
  });
  await AuditLog.create({ organizationId, actorId: req.user._id, action: 'post_created', targetType: 'Post', targetId: post._id, after: post.toObject() });
  await Notification.create({ organizationId, audience: 'organization', title: post.title, message: 'New announcement published', category: 'announcement' });
  res.status(201).json({ post });
};

exports.updatePost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManagePosts(req.user)) return res.status(403).json({ error: 'Not authorized to update posts' });
  const post = await Post.findOne({ _id: req.params.id, organizationId, deletedAt: null });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const before = post.toObject();
  ['title', 'body', 'visibility', 'priority', 'category', 'status', 'publishAt', 'expiresAt'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) post[field] = req.body[field];
  });
  if (Array.isArray(req.body.tags)) post.tags = req.body.tags;
  if (Array.isArray(req.body.roles)) post.roles = req.body.roles;
  if (Array.isArray(req.body.attachments)) post.attachments = req.body.attachments;
  post.history.push({ actorId: req.user._id, action: 'updated', before, after: req.body });
  await post.save();
  res.json({ post });
};

exports.deletePost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManagePosts(req.user)) return res.status(403).json({ error: 'Not authorized to delete posts' });
  const post = await Post.findOneAndUpdate({ _id: req.params.id, organizationId }, { deletedAt: new Date(), status: 'archived' }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ message: 'Post archived', post });
};

exports.addComment = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOne({ _id: req.params.id, organizationId, deletedAt: null });
  if (!post || !canReadPost(post, req.user)) return res.status(404).json({ error: 'Post not found' });
  post.comments.push({ authorId: req.user._id, body: req.body.body, attachments: req.body.attachments || [], parentCommentId: req.body.parentCommentId || null });
  await post.save();
  res.status(201).json({ post });
};

exports.updateComment = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOne({ _id: req.params.id, organizationId });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (String(comment.authorId) !== String(req.user._id) && !canManagePosts(req.user)) return res.status(403).json({ error: 'Forbidden' });
  comment.body = req.body.body || comment.body;
  comment.editedAt = new Date();
  await post.save();
  res.json({ post });
};

exports.deleteComment = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOne({ _id: req.params.id, organizationId });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (String(comment.authorId) !== String(req.user._id) && !canManagePosts(req.user)) return res.status(403).json({ error: 'Forbidden' });
  comment.deletedAt = new Date();
  await post.save();
  res.json({ post });
};

exports.likePost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOneAndUpdate({ _id: req.params.id, organizationId }, { $addToSet: { likes: req.user._id } }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
};

exports.unlikePost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const post = await Post.findOneAndUpdate({ _id: req.params.id, organizationId }, { $pull: { likes: req.user._id } }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
};

exports.pinPost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManagePosts(req.user)) return res.status(403).json({ error: 'Forbidden' });
  const post = await Post.findOneAndUpdate({ _id: req.params.id, organizationId }, { pinned: true }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
};

exports.unpinPost = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManagePosts(req.user)) return res.status(403).json({ error: 'Forbidden' });
  const post = await Post.findOneAndUpdate({ _id: req.params.id, organizationId }, { pinned: false }, { new: true });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
};
