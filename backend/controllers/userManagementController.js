const AuditLog = require('../models/AuditLog');
const Organization = require('../models/Organization');
const OrganizationInvite = require('../models/OrganizationInvite');
const User = require('../models/User');

const MANAGE_ROLES = ['super_admin', 'org_owner', 'org_admin'];
const READ_ROLES = ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'finance_manager'];
const ALL_ROLES = [
  'super_admin',
  'org_owner',
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
  'customer',
  'admin',
  'fare_manager',
  'user'
];
const STATUSES = ['ACTIVE', 'PENDING', 'INVITED', 'SUSPENDED', 'DEACTIVATED', 'ARCHIVED'];

function canManageUsers(user) {
  return Boolean(user && MANAGE_ROLES.includes(user.role));
}

function canReadUsers(user) {
  return Boolean(user && READ_ROLES.includes(user.role));
}

function canAccessUser(reqUser, targetUser) {
  if (reqUser.role === 'super_admin') return true;
  if (targetUser._id.toString() === reqUser._id.toString()) return true;
  return targetUser.organizationId?.toString() === reqUser.organizationId?.toString() && canReadUsers(reqUser);
}

function parsePagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function sortFromQuery(query) {
  const allowed = ['name', 'email', 'role', 'status', 'department', 'designation', 'joiningDate', 'createdAt', 'updatedAt'];
  const field = allowed.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  return { [field]: direction };
}

function cleanString(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeStatus(status) {
  const value = String(status || '').toUpperCase();
  return STATUSES.includes(value) ? value : 'ACTIVE';
}

function safeUser(user) {
  if (!user) return null;
  const source = user.toObject ? user.toObject() : user;
  return {
    _id: source._id,
    name: source.name,
    email: source.email,
    avatar: source.avatar,
    phone: source.phone,
    employeeId: source.employeeId,
    designation: source.designation,
    department: source.department,
    joiningDate: source.joiningDate,
    lastLogin: source.lastLogin,
    role: source.role,
    status: source.status,
    isActive: source.isActive,
    isDeleted: source.isDeleted,
    deletedAt: source.deletedAt,
    deletedBy: source.deletedBy,
    createdBy: source.createdBy,
    updatedBy: source.updatedBy,
    notes: source.notes,
    emergencyContact: source.emergencyContact,
    address: source.address,
    dateOfBirth: source.dateOfBirth,
    gender: source.gender,
    language: source.language,
    timezone: source.timezone,
    preferences: source.preferences,
    notificationSettings: source.notificationSettings,
    clerkUserId: source.clerkUserId,
    organizationId: source.organizationId,
    balance: source.balance,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  };
}

function buildUserPayload(body, actorId, existing = null) {
  const payload = {};
  const simpleFields = [
    'name',
    'avatar',
    'phone',
    'employeeId',
    'designation',
    'department',
    'notes',
    'gender',
    'language',
    'timezone'
  ];

  simpleFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = cleanString(body[field]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(body, 'email')) payload.email = normalizeEmail(body.email);
  if (Object.prototype.hasOwnProperty.call(body, 'role') && ALL_ROLES.includes(body.role)) payload.role = body.role;
  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    payload.status = normalizeStatus(body.status);
    payload.isActive = payload.status === 'ACTIVE';
  }
  if (Object.prototype.hasOwnProperty.call(body, 'isActive')) payload.isActive = Boolean(body.isActive);
  if (body.joiningDate) payload.joiningDate = new Date(body.joiningDate);
  if (body.dateOfBirth) payload.dateOfBirth = new Date(body.dateOfBirth);
  ['emergencyContact', 'address', 'preferences', 'notificationSettings'].forEach((field) => {
    if (body[field] && typeof body[field] === 'object') {
      Object.entries(body[field]).forEach(([key, value]) => {
        payload[`${field}.${key}`] = cleanString(value);
      });
    }
  });

  payload.updatedBy = actorId;
  if (!existing) payload.createdBy = actorId;
  return payload;
}

function buildListQuery(req) {
  const query = { isDeleted: { $ne: true } };
  if (req.user.role !== 'super_admin') {
    query.organizationId = req.user.organizationId;
  } else if (req.query.organizationId) {
    query.organizationId = req.query.organizationId;
  }

  if (req.query.includeDeleted === 'true' && req.user.role === 'super_admin') {
    delete query.isDeleted;
  }
  if (req.query.status && req.query.status !== 'all') query.status = normalizeStatus(req.query.status);
  if (req.query.role && req.query.role !== 'all') query.role = req.query.role;
  if (req.query.department) query.department = new RegExp(String(req.query.department).trim(), 'i');
  if (req.query.designation) query.designation = new RegExp(String(req.query.designation).trim(), 'i');
  if (req.query.active === 'true') query.isActive = true;
  if (req.query.active === 'false') query.isActive = false;
  if (req.query.joiningFrom || req.query.joiningTo) {
    query.joiningDate = {};
    if (req.query.joiningFrom) query.joiningDate.$gte = new Date(req.query.joiningFrom);
    if (req.query.joiningTo) query.joiningDate.$lte = new Date(req.query.joiningTo);
  }
  if (req.query.search) {
    const search = new RegExp(String(req.query.search).trim(), 'i');
    query.$or = [
      { name: search },
      { email: search },
      { phone: search },
      { employeeId: search },
      { role: search },
      { department: search },
      { designation: search },
      { status: search }
    ];
  }
  return query;
}

async function writeAudit(req, action, targetUser, before, after, metadata) {
  await AuditLog.create({
    organizationId: targetUser.organizationId || req.user.organizationId || null,
    actorId: req.user._id,
    action,
    targetType: 'User',
    targetId: targetUser._id,
    before,
    after,
    metadata
  });
}

async function loadScopedUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user || (user.isDeleted && req.method === 'GET' && req.query.includeDeleted !== 'true')) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  if (!canAccessUser(req.user, user)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}

exports.listUsers = async (req, res) => {
  try {
    if (!canReadUsers(req.user)) return res.status(403).json({ error: 'User management read access required' });
    const { page, limit, skip } = parsePagination(req.query);
    const query = buildListQuery(req);
    const [users, total] = await Promise.all([
      User.find(query).sort(sortFromQuery(req.query)).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);
    res.json({ users: users.map(safeUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

exports.searchUsers = exports.listUsers;

exports.getUser = async (req, res) => {
  try {
    const user = await loadScopedUser(req, res);
    if (!user) return;
    const activity = await AuditLog.find({ targetType: 'User', targetId: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('actorId', 'name email role')
      .lean();
    res.json({ user: safeUser(user), activity });
  } catch (error) {
    console.error('getUser error:', error);
    res.status(500).json({ error: 'Failed to load user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    const email = normalizeEmail(req.body.email);
    if (!email || !req.body.name) return res.status(400).json({ error: 'Name and email are required' });
    if (req.body.role && !ALL_ROLES.includes(req.body.role)) return res.status(400).json({ error: 'Invalid role' });

    const organizationId = req.user.role === 'super_admin' && req.body.organizationId ? req.body.organizationId : req.user.organizationId;
    const organization = await Organization.findById(organizationId);
    if (!organization || organization.status === 'archived') return res.status(400).json({ error: 'Valid organization is required' });

    const payload = buildUserPayload({ ...req.body, email }, req.user._id);
    payload.organizationId = organizationId;
    payload.status = req.body.status ? normalizeStatus(req.body.status) : 'PENDING';
    payload.isActive = payload.status === 'ACTIVE';
    payload.balance = req.body.balance ?? 1000;

    const user = await User.create(payload);
    await writeAudit(req, 'user_created', user, null, safeUser(user), { source: 'manual' });
    res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'User email, Clerk id, or employee id already exists' });
    console.error('createUser error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await loadScopedUser(req, res);
    if (!user) return;
    const selfEdit = user._id.toString() === req.user._id.toString();
    if (!selfEdit && !canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });

    const before = safeUser(user);
    const payload = buildUserPayload(req.body, req.user._id, user);
    if (selfEdit && !canManageUsers(req.user)) {
      delete payload.role;
      delete payload.status;
      delete payload.isActive;
      delete payload.employeeId;
      delete payload.department;
      delete payload.designation;
    }
    Object.assign(user, payload);
    await user.save();
    await writeAudit(req, selfEdit ? 'user_profile_updated' : 'user_updated', user, before, safeUser(user));
    res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    const user = await loadScopedUser(req, res);
    if (!user) return;
    const before = safeUser(user);
    user.isDeleted = true;
    user.isActive = false;
    user.status = 'ARCHIVED';
    user.deletedAt = new Date();
    user.deletedBy = req.user._id;
    user.updatedBy = req.user._id;
    await user.save();
    await writeAudit(req, 'user_deleted', user, before, safeUser(user));
    res.json({ message: 'User deleted', user: safeUser(user) });
  } catch (error) {
    console.error('softDeleteUser error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

async function setUserStatus(req, res, status, action) {
  if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
  const user = await loadScopedUser(req, res);
  if (!user) return;
  const before = safeUser(user);
  user.status = status;
  user.isActive = status === 'ACTIVE';
  if (status !== 'ARCHIVED') {
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
  }
  user.updatedBy = req.user._id;
  await user.save();
  await writeAudit(req, action, user, before, safeUser(user));
  res.json({ message: `User ${status.toLowerCase()}`, user: safeUser(user) });
}

exports.archiveUser = (req, res) => setUserStatus(req, res, 'ARCHIVED', 'user_archived');
exports.restoreUser = (req, res) => setUserStatus(req, res, 'ACTIVE', 'user_restored');
exports.suspendUser = (req, res) => setUserStatus(req, res, 'SUSPENDED', 'user_suspended');
exports.activateUser = (req, res) => setUserStatus(req, res, 'ACTIVE', 'user_activated');

exports.changeRole = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    if (!ALL_ROLES.includes(req.body.role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await loadScopedUser(req, res);
    if (!user) return;
    const before = { role: user.role };
    user.role = req.body.role;
    user.updatedBy = req.user._id;
    await user.save();
    await writeAudit(req, 'user_role_assigned', user, before, { role: user.role });
    res.json({ message: 'Role updated', user: safeUser(user) });
  } catch (error) {
    console.error('changeRole error:', error);
    res.status(500).json({ error: 'Failed to change role' });
  }
};

exports.transferUser = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super admin access required' });
    const organization = await Organization.findById(req.body.organizationId);
    if (!organization || organization.status === 'archived') return res.status(400).json({ error: 'Valid target organization is required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const before = { organizationId: user.organizationId };
    user.organizationId = organization._id;
    user.updatedBy = req.user._id;
    await user.save();
    await writeAudit(req, 'user_transferred', user, before, { organizationId: user.organizationId });
    res.json({ message: 'User transferred', user: safeUser(user) });
  } catch (error) {
    console.error('transferUser error:', error);
    res.status(500).json({ error: 'Failed to transfer user' });
  }
};

exports.bulkUsers = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    const ids = Array.isArray(req.body.userIds) ? req.body.userIds : [];
    if (!ids.length) return res.status(400).json({ error: 'userIds are required' });
    const query = { _id: { $in: ids } };
    if (req.user.role !== 'super_admin') query.organizationId = req.user.organizationId;

    const update = { updatedBy: req.user._id };
    let action = 'user_updated';
    if (req.body.action === 'suspend') Object.assign(update, { status: 'SUSPENDED', isActive: false }), action = 'user_suspended';
    else if (req.body.action === 'activate') Object.assign(update, { status: 'ACTIVE', isActive: true, isDeleted: false }), action = 'user_activated';
    else if (req.body.action === 'archive' || req.body.action === 'delete') Object.assign(update, { status: 'ARCHIVED', isActive: false, isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id }), action = req.body.action === 'delete' ? 'user_deleted' : 'user_archived';
    else if (req.body.action === 'role' && ALL_ROLES.includes(req.body.role)) Object.assign(update, { role: req.body.role }), action = 'user_role_assigned';
    else if (req.body.action === 'transfer' && req.user.role === 'super_admin' && req.body.organizationId) Object.assign(update, { organizationId: req.body.organizationId }), action = 'user_transferred';
    else return res.status(400).json({ error: 'Unsupported bulk action' });

    const result = await User.updateMany(query, { $set: update });
    await AuditLog.create({
      organizationId: req.user.organizationId || null,
      actorId: req.user._id,
      action,
      targetType: 'User',
      metadata: { userIds: ids, action: req.body.action, matched: result.matchedCount, modified: result.modifiedCount }
    });
    res.json({ message: 'Bulk action complete', matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    console.error('bulkUsers error:', error);
    res.status(500).json({ error: 'Failed to run bulk action' });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    if (!canReadUsers(req.user)) return res.status(403).json({ error: 'User management read access required' });
    const users = await User.find(buildListQuery(req)).sort(sortFromQuery(req.query)).lean();
    const columns = ['name', 'email', 'phone', 'employeeId', 'role', 'status', 'department', 'designation', 'joiningDate'];
    const csv = [
      columns.join(','),
      ...users.map((user) =>
        columns
          .map((column) => `"${String(user[column] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');
    await AuditLog.create({
      organizationId: req.user.organizationId || null,
      actorId: req.user._id,
      action: 'user_exported',
      targetType: 'User',
      metadata: { count: users.length, format: 'csv' }
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    console.error('exportUsers error:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
};

exports.importUsers = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    const rows = Array.isArray(req.body.users) ? req.body.users : [];
    if (!rows.length) return res.status(400).json({ error: 'users array is required for import' });
    const errors = [];
    const created = [];
    const rollbackIds = [];

    for (const [index, row] of rows.entries()) {
      try {
        const email = normalizeEmail(row.email);
        if (!email || !row.name) throw new Error('Name and email are required');
        const duplicate = await User.findOne({ email });
        if (duplicate) throw new Error('Duplicate email');
        const user = await User.create({
          ...buildUserPayload({ ...row, email }, req.user._id),
          organizationId: req.user.role === 'super_admin' && row.organizationId ? row.organizationId : req.user.organizationId,
          status: row.status ? normalizeStatus(row.status) : 'PENDING',
          isActive: normalizeStatus(row.status) === 'ACTIVE'
        });
        created.push(safeUser(user));
        rollbackIds.push(user._id);
      } catch (error) {
        errors.push({ row: index + 1, email: row.email, error: error.message });
      }
    }

    if (req.body.rollbackOnError && errors.length && rollbackIds.length) {
      await User.deleteMany({ _id: { $in: rollbackIds } });
      created.length = 0;
    }

    await AuditLog.create({
      organizationId: req.user.organizationId || null,
      actorId: req.user._id,
      action: 'user_imported',
      targetType: 'User',
      metadata: { created: created.length, errors: errors.length }
    });
    res.status(errors.length ? 207 : 201).json({ created, errors });
  } catch (error) {
    console.error('importUsers error:', error);
    res.status(500).json({ error: 'Failed to import users' });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    if (!canReadUsers(req.user)) return res.status(403).json({ error: 'User management read access required' });
    const query = { targetType: 'User' };
    if (req.user.role !== 'super_admin') query.organizationId = req.user.organizationId;
    if (req.query.userId) query.targetId = req.query.userId;
    const activity = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100).populate('actorId', 'name email role').lean();
    res.json({ activity });
  } catch (error) {
    console.error('getUserActivity error:', error);
    res.status(500).json({ error: 'Failed to load user activity' });
  }
};

exports.resendInvite = async (req, res) => {
  try {
    if (!canManageUsers(req.user)) return res.status(403).json({ error: 'User management access required' });
    const invite = await OrganizationInvite.findById(req.params.inviteId).select('-tokenHash');
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (req.user.role !== 'super_admin' && invite.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invite.status = 'pending';
    await invite.save();
    res.json({ message: 'Invite resent', invite });
  } catch (error) {
    console.error('resendInvite error:', error);
    res.status(500).json({ error: 'Failed to resend invite' });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const invite = await OrganizationInvite.findById(req.params.inviteId).select('-tokenHash');
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.email !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    invite.status = 'cancelled';
    await invite.save();
    res.json({ message: 'Invite rejected' });
  } catch (error) {
    console.error('rejectInvite error:', error);
    res.status(500).json({ error: 'Failed to reject invite' });
  }
};
