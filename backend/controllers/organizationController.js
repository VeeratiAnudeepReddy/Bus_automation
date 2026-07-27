const crypto = require('crypto');
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const Organization = require('../models/Organization');
const OrganizationInvite = require('../models/OrganizationInvite');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const MANAGER_ROLES = ['org_owner', 'org_admin', 'super_admin'];
const INVITABLE_ROLES = [
  'org_admin',
  'operations_manager',
  'fleet_manager',
  'finance_manager',
  'price_manager',
  'dispatcher',
  'scheduler',
  'bus_manager',
  'driver',
  'conductor',
  'support',
  'customer'
];

function objectId(value) {
  return new mongoose.Types.ObjectId(value);
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function cleanString(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function pickObject(input, allowedFields) {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  return allowedFields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      result[field] = cleanString(input[field]);
    }
    return result;
  }, {});
}

function parsePagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

function canManageOrganization(user, organizationId) {
  if (!user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return (
    MANAGER_ROLES.includes(user.role) &&
    user.organizationId &&
    user.organizationId.toString() === organizationId.toString()
  );
}

function canViewOrganization(user, organizationId) {
  if (!user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return user.organizationId && user.organizationId.toString() === organizationId.toString();
}

function serializeOrganization(organization) {
  return {
    _id: organization._id,
    name: organization.name,
    slug: organization.slug,
    city: organization.city,
    status: organization.status,
    ownerUserId: organization.ownerUserId,
    billingContact: organization.billingContact,
    contact: organization.contact,
    address: organization.address,
    businessDetails: organization.businessDetails,
    branding: organization.branding,
    settings: organization.settings,
    subscription: organization.subscription,
    razorpayRoute: organization.razorpayRoute || {
      linkedAccountId: null,
      status: 'none',
      onboardedAt: null,
      notes: null
    },
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt
  };
}

function buildOrganizationUpdate(body) {
  const update = {};
  const topLevel = ['name', 'city'];
  topLevel.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      update[field] = cleanString(body[field]);
    }
  });

  const nested = {
    billingContact: ['name', 'email', 'phone'],
    contact: ['email', 'phone', 'supportEmail'],
    address: ['line1', 'line2', 'city', 'state', 'pincode', 'country'],
    businessDetails: ['legalName', 'gstNumber', 'registrationNumber', 'website'],
    branding: ['logoUrl', 'primaryColor', 'secondaryColor', 'accentColor'],
    settings: ['timezone', 'currency', 'ticketPrefix', 'allowPublicBooking'],
    subscription: ['plan', 'status', 'renewsAt']
  };

  Object.entries(nested).forEach(([group, fields]) => {
    const values = pickObject(body[group], fields);
    if (values && Object.keys(values).length) {
      Object.entries(values).forEach(([field, value]) => {
        update[`${group}.${field}`] = value;
      });
    }
  });

  // Razorpay Route linked-account binding (org_owner / managers).
  if (body.razorpayRoute && typeof body.razorpayRoute === 'object') {
    const route = body.razorpayRoute;
    if (Object.prototype.hasOwnProperty.call(route, 'linkedAccountId')) {
      update['razorpayRoute.linkedAccountId'] = cleanString(route.linkedAccountId);
    }
    if (Object.prototype.hasOwnProperty.call(route, 'status')) {
      const status = cleanString(route.status);
      if (status && ['none', 'pending', 'active', 'suspended'].includes(status)) {
        update['razorpayRoute.status'] = status;
      }
    }
    if (Object.prototype.hasOwnProperty.call(route, 'notes')) {
      update['razorpayRoute.notes'] = cleanString(route.notes);
    }
    if (update['razorpayRoute.status'] === 'active' || route.onboardedAt) {
      update['razorpayRoute.onboardedAt'] = route.onboardedAt
        ? new Date(route.onboardedAt)
        : new Date();
    }
  }

  return update;
}

async function writeAudit({ organizationId, actorId, action, targetType, targetId, before, after, metadata }) {
  await AuditLog.create({
    organizationId,
    actorId,
    action,
    targetType,
    targetId,
    before,
    after,
    metadata
  });
}

exports.listOrganizations = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (req.user.role !== 'super_admin') {
      query._id = req.user.organizationId;
    }
    if (req.query.status && req.user.role === 'super_admin') {
      query.status = req.query.status;
    } else {
      query.status = { $ne: 'archived' };
    }
    if (req.query.search) {
      const search = new RegExp(String(req.query.search).trim(), 'i');
      query.$or = [{ name: search }, { slug: search }, { city: search }];
    }

    const [organizations, total] = await Promise.all([
      Organization.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Organization.countDocuments(query)
    ]);

    res.json({
      organizations: organizations.map(serializeOrganization),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (error) {
    console.error('listOrganizations error:', error);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const { name, city = 'Hyderabad' } = req.body;
    const slug = normalizeSlug(req.body.slug || name);
    const userId = req.user._id;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Missing required fields: name, slug' });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Slug must be lowercase alphanumeric with hyphens only' });
    }

    const existingOrg = await Organization.findOne({ ownerUserId: userId, status: { $ne: 'archived' } });
    if (existingOrg && req.user.role !== 'super_admin') {
      return res.status(400).json({ error: 'User already owns an organization' });
    }

    const organization = await Organization.create({
      name: cleanString(name),
      slug,
      city: cleanString(city) || 'Hyderabad',
      status: req.user.role === 'super_admin' ? 'active' : 'pending',
      ownerUserId: userId,
      billingContact: pickObject(req.body.billingContact, ['name', 'email', 'phone']),
      contact: pickObject(req.body.contact, ['email', 'phone', 'supportEmail']),
      address: pickObject(req.body.address, ['line1', 'line2', 'city', 'state', 'pincode', 'country']),
      businessDetails: pickObject(req.body.businessDetails, ['legalName', 'gstNumber', 'registrationNumber', 'website']),
      branding: pickObject(req.body.branding, ['logoUrl', 'primaryColor', 'secondaryColor', 'accentColor']),
      settings: pickObject(req.body.settings, ['timezone', 'currency', 'ticketPrefix', 'allowPublicBooking'])
    });

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          organizationId: organization._id,
          role: req.user.role === 'super_admin' ? req.user.role : 'org_owner'
        }
      }
    );

    await writeAudit({
      organizationId: organization._id,
      actorId: userId,
      action: 'org_created',
      targetType: 'Organization',
      targetId: organization._id,
      after: serializeOrganization(organization)
    });

    res.status(201).json({
      organization: serializeOrganization(organization),
      message:
        organization.status === 'active'
          ? 'Organization created.'
          : 'Organization created. Awaiting super admin approval.'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Slug already in use' });
    }
    console.error('createOrganization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate('ownerUserId', 'email name role');
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canViewOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ organization: serializeOrganization(organization) });
  } catch (error) {
    console.error('getOrganization error:', error);
    res.status(500).json({ error: 'Failed to load organization' });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canManageOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Only organization managers can update this organization' });
    }

    const before = serializeOrganization(organization);
    const updateData = buildOrganizationUpdate(req.body);
    if (!Object.keys(updateData).length) {
      return res.status(400).json({ error: 'No supported organization fields provided' });
    }

    const updated = await Organization.findByIdAndUpdate(req.params.id, { $set: updateData }, {
      new: true,
      runValidators: true
    });

    await writeAudit({
      organizationId: updated._id,
      actorId: req.user._id,
      action: 'org_updated',
      targetType: 'Organization',
      targetId: updated._id,
      before,
      after: updateData
    });

    res.json({ organization: serializeOrganization(updated) });
  } catch (error) {
    console.error('updateOrganization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

exports.archiveOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canManageOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Only organization managers can archive this organization' });
    }

    const before = { status: organization.status };
    organization.status = 'archived';
    await organization.save();
    await OrganizationInvite.updateMany({ organizationId: organization._id, status: 'pending' }, { $set: { status: 'cancelled' } });

    await writeAudit({
      organizationId: organization._id,
      actorId: req.user._id,
      action: 'org_archived',
      targetType: 'Organization',
      targetId: organization._id,
      before,
      after: { status: 'archived' }
    });

    res.json({ message: 'Organization archived', organization: serializeOrganization(organization) });
  } catch (error) {
    console.error('archiveOrganization error:', error);
    res.status(500).json({ error: 'Failed to archive organization' });
  }
};

exports.getOrganizationDashboard = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canViewOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const organizationId = objectId(organization._id);
    const [members, routes, activeRoutes, tickets, revenue, pendingInvites, recentActivity] = await Promise.all([
      User.countDocuments({ organizationId }),
      Route.countDocuments({ organizationId }),
      Route.countDocuments({ organizationId, active: true }),
      Ticket.countDocuments({ organizationId }),
      Ticket.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ]),
      OrganizationInvite.countDocuments({ organizationId, status: 'pending', expiresAt: { $gt: new Date() } }),
      AuditLog.find({ organizationId })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('actorId', 'name email role')
        .lean()
    ]);

    res.json({
      organization: serializeOrganization(organization),
      stats: {
        members,
        routes,
        activeRoutes,
        tickets,
        revenue: revenue[0]?.total || 0,
        pendingInvites
      },
      recentActivity
    });
  } catch (error) {
    console.error('getOrganizationDashboard error:', error);
    res.status(500).json({ error: 'Failed to load organization dashboard' });
  }
};

exports.listMembers = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canViewOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const query = { organizationId: organization._id };
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    if (req.query.status && req.query.status !== 'all') {
      query.status = String(req.query.status).toUpperCase();
    }
    if (req.query.search) {
      const search = new RegExp(String(req.query.search).trim(), 'i');
      query.$or = [{ name: search }, { email: search }, { phone: search }];
    }

    const [members, total] = await Promise.all([
      User.find(query)
        .select('_id name email phone role status balance organizationId createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({ members, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  } catch (error) {
    console.error('listMembers error:', error);
    res.status(500).json({ error: 'Failed to list organization members' });
  }
};

exports.sendInvite = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    const email = String(req.body.email || '').trim().toLowerCase();
    const role = String(req.body.role || '').trim();

    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canManageOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Only organization managers can send invites' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !INVITABLE_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Valid email and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.organizationId?.toString() !== organization._id.toString()) {
      return res.status(400).json({ error: 'User already belongs to a different organization' });
    }

    await OrganizationInvite.updateMany(
      { organizationId: organization._id, email, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    const token = crypto.randomBytes(32).toString('hex');
    const invite = await OrganizationInvite.create({
      organizationId: organization._id,
      email,
      role,
      tokenHash: tokenHash(token),
      invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await writeAudit({
      organizationId: organization._id,
      actorId: req.user._id,
      action: 'user_invited',
      targetType: 'User',
      metadata: { email, role, inviteId: invite._id }
    });

    res.status(201).json({
      message: 'Invite created',
      invite: {
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        acceptLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${token}`
      }
    });
  } catch (error) {
    console.error('sendInvite error:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
};

exports.listInvites = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canManageOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Only organization managers can view invites' });
    }

    await OrganizationInvite.updateMany(
      { organizationId: organization._id, status: 'pending', expiresAt: { $lte: new Date() } },
      { $set: { status: 'expired' } }
    );

    const invites = await OrganizationInvite.find({ organizationId: organization._id })
      .sort({ createdAt: -1 })
      .populate('invitedBy', 'name email role')
      .populate('acceptedBy', 'name email role')
      .select('-tokenHash')
      .lean();

    res.json({ invites });
  } catch (error) {
    console.error('listInvites error:', error);
    res.status(500).json({ error: 'Failed to list invites' });
  }
};

exports.cancelInvite = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canManageOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Only organization managers can cancel invites' });
    }

    const invite = await OrganizationInvite.findOne({
      _id: req.params.inviteId,
      organizationId: organization._id,
      status: 'pending'
    });
    if (!invite) {
      return res.status(404).json({ error: 'Pending invite not found' });
    }

    invite.status = 'cancelled';
    await invite.save();

    await writeAudit({
      organizationId: organization._id,
      actorId: req.user._id,
      action: 'user_invite_cancelled',
      targetType: 'User',
      metadata: { email: invite.email, role: invite.role, inviteId: invite._id }
    });

    res.json({ message: 'Invite cancelled' });
  } catch (error) {
    console.error('cancelInvite error:', error);
    res.status(500).json({ error: 'Failed to cancel invite' });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const invite = await OrganizationInvite.findOne({ tokenHash: tokenHash(req.params.token) });
    if (!invite || invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ error: 'Invite token expired' });
    }
    if (req.user.email.toLowerCase() !== invite.email) {
      return res.status(400).json({ error: 'Email mismatch: signed-in email does not match invite email' });
    }

    const organization = await Organization.findById(invite.organizationId);
    if (!organization || organization.status !== 'active') {
      return res.status(400).json({ error: 'Organization is not active' });
    }

    const before = { role: req.user.role, organizationId: req.user.organizationId };
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          organizationId: invite.organizationId,
          role: invite.role,
          status: 'active'
        }
      }
    );

    invite.status = 'accepted';
    invite.acceptedBy = req.user._id;
    invite.acceptedAt = new Date();
    await invite.save();

    await writeAudit({
      organizationId: invite.organizationId,
      actorId: req.user._id,
      action: 'user_invite_accepted',
      targetType: 'User',
      targetId: req.user._id,
      before,
      after: { role: invite.role, organizationId: invite.organizationId },
      metadata: { inviteId: invite._id }
    });

    res.json({
      message: 'Invite accepted',
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: invite.role,
        organizationId: invite.organizationId
      }
    });
  } catch (error) {
    console.error('acceptInvite error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};

exports.approveOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (organization.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve organization with status '${organization.status}'` });
    }

    organization.status = 'active';
    await organization.save();

    await writeAudit({
      organizationId: organization._id,
      actorId: req.user._id,
      action: 'org_approved',
      targetType: 'Organization',
      targetId: organization._id,
      before: { status: 'pending' },
      after: { status: 'active' }
    });

    res.json({ message: 'Organization approved', organization: serializeOrganization(organization) });
  } catch (error) {
    console.error('approveOrganization error:', error);
    res.status(500).json({ error: 'Failed to approve organization' });
  }
};

exports.suspendOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (organization.status === 'suspended') {
      return res.status(400).json({ error: 'Organization already suspended' });
    }

    const previousStatus = organization.status;
    organization.status = 'suspended';
    await organization.save();

    await writeAudit({
      organizationId: organization._id,
      actorId: req.user._id,
      action: 'org_suspended',
      targetType: 'Organization',
      targetId: organization._id,
      before: { status: previousStatus },
      after: { status: 'suspended' }
    });

    res.json({ message: 'Organization suspended', organization: serializeOrganization(organization) });
  } catch (error) {
    console.error('suspendOrganization error:', error);
    res.status(500).json({ error: 'Failed to suspend organization' });
  }
};

exports.switchOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization || organization.status === 'archived') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!canViewOrganization(req.user, organization._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      message: 'Organization context selected',
      organization: serializeOrganization(organization)
    });
  } catch (error) {
    console.error('switchOrganization error:', error);
    res.status(500).json({ error: 'Failed to switch organization' });
  }
};
