const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const canManageSupport = (user) => ['super_admin', 'org_owner', 'org_admin', 'support'].includes(user.role);
const pagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

exports.listTickets = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const { page, limit, skip } = pagination(req.query);
  const query = { organizationId };
  if (!canManageSupport(req.user)) query.requesterId = req.user._id;
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.search) {
    const search = new RegExp(String(req.query.search).trim(), 'i');
    query.$or = [{ title: search }, { description: search }, { ticketNumber: search }];
  }
  const [tickets, total] = await Promise.all([
    SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('requesterId assignedTo', 'name email role').lean(),
    SupportTicket.countDocuments(query)
  ]);
  res.json({ tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
};

exports.getTicket = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const ticket = await SupportTicket.findOne({ _id: req.params.id, organizationId }).populate('requesterId assignedTo replies.authorId', 'name email role').lean();
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
  if (!canManageSupport(req.user) && String(ticket.requesterId._id || ticket.requesterId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
  res.json({ ticket });
};

exports.createTicket = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!req.body.title || !req.body.description) return res.status(400).json({ error: 'title and description are required' });
  const ticket = await SupportTicket.create({
    organizationId,
    ticketNumber: `SUP-${Date.now()}`,
    requesterId: req.user._id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || 'general',
    priority: req.body.priority || 'normal',
    slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    attachments: req.body.attachments || [],
    history: [{ actorId: req.user._id, action: 'created', after: req.body }]
  });
  await AuditLog.create({ organizationId, actorId: req.user._id, action: 'support_ticket_created', targetType: 'SupportTicket', targetId: ticket._id, after: ticket.toObject() });
  res.status(201).json({ ticket });
};

exports.updateTicket = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const ticket = await SupportTicket.findOne({ _id: req.params.id, organizationId });
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
  if (!canManageSupport(req.user) && String(ticket.requesterId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
  const before = ticket.toObject();
  ['title', 'description', 'category', 'priority', 'status', 'assignedTo'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) ticket[field] = req.body[field] || null;
  });
  if (req.body.status === 'escalated' && !ticket.escalatedAt) ticket.escalatedAt = new Date();
  ticket.history.push({ actorId: req.user._id, action: 'updated', before, after: req.body });
  await ticket.save();
  res.json({ ticket });
};

exports.deleteTicket = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  if (!canManageSupport(req.user)) return res.status(403).json({ error: 'Forbidden' });
  const ticket = await SupportTicket.findOneAndUpdate({ _id: req.params.id, organizationId }, { status: 'closed' }, { new: true });
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
  res.json({ message: 'Support ticket closed', ticket });
};

exports.reply = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const ticket = await SupportTicket.findOne({ _id: req.params.id, organizationId });
  if (!ticket) return res.status(404).json({ error: 'Support ticket not found' });
  if (!canManageSupport(req.user) && String(ticket.requesterId) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
  ticket.replies.push({ authorId: req.user._id, body: req.body.body, internal: Boolean(req.body.internal && canManageSupport(req.user)), attachments: req.body.attachments || [] });
  if (canManageSupport(req.user) && String(ticket.requesterId) !== String(req.user._id)) ticket.status = 'pending';
  await ticket.save();
  await Notification.create({ organizationId, userId: ticket.requesterId, audience: 'user', title: ticket.title, message: 'Support ticket has a new reply', category: 'announcement' });
  res.status(201).json({ ticket });
};
