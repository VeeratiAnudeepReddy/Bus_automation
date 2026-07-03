const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

exports.listNotifications = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const notifications = await Notification.find({
    organizationId,
    $or: [{ userId: req.user._id }, { audience: 'organization' }, { audience: 'role', role: req.user.role }]
  }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ notifications });
};

exports.createNotification = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const notification = await Notification.create({
    organizationId,
    userId: req.body.userId || null,
    audience: req.body.audience || 'organization',
    role: req.body.role || null,
    channel: req.body.channel || 'in_app',
    title: req.body.title,
    message: req.body.message,
    category: req.body.category || 'announcement'
  });
  res.status(201).json({ notification });
};

exports.preferences = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const preferences = await NotificationPreference.findOneAndUpdate(
    { organizationId, userId: req.user._id },
    { $setOnInsert: { organizationId, userId: req.user._id } },
    { new: true, upsert: true }
  ).lean();
  res.json({ preferences });
};

exports.updatePreferences = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const preferences = await NotificationPreference.findOneAndUpdate(
    { organizationId, userId: req.user._id },
    { $set: req.body, $setOnInsert: { organizationId, userId: req.user._id } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  res.json({ preferences });
};

exports.markRead = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.id].filter(Boolean);
  const result = await Notification.updateMany(
    { _id: { $in: ids }, organizationId, $or: [{ userId: req.user._id }, { audience: 'organization' }, { audience: 'role', role: req.user.role }] },
    { $set: { readAt: new Date() } }
  );
  res.json({ modified: result.modifiedCount });
};

exports.markAllRead = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const result = await Notification.updateMany(
    { organizationId, readAt: null, $or: [{ userId: req.user._id }, { audience: 'organization' }, { audience: 'role', role: req.user.role }] },
    { $set: { readAt: new Date() } }
  );
  res.json({ modified: result.modifiedCount });
};

exports.deleteNotification = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  await Notification.deleteOne({ _id: req.params.id, organizationId, $or: [{ userId: req.user._id }, { audience: 'organization' }, { audience: 'role', role: req.user.role }] });
  res.json({ message: 'Notification deleted' });
};
