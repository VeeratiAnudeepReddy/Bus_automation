const User = require('../models/User');
const Organization = require('../models/Organization');
const OrganizationInvite = require('../models/OrganizationInvite');
const crypto = require('crypto');

const EMPLOYEE_ROLES = [
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
  'support'
];

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

function profileComplete(user) {
  if (!user) return false;
  return Boolean(
    user.name &&
      user.email &&
      user.phone &&
      user.phone !== 'N/A' &&
      user.timezone &&
      user.language &&
      user.address?.city
  );
}

function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    balance: user.balance,
    clerkUserId: user.clerkUserId,
    organizationId: user.organizationId,
    avatar: user.avatar,
    employeeId: user.employeeId,
    designation: user.designation,
    department: user.department,
    emergencyContact: user.emergencyContact,
    address: user.address,
    language: user.language,
    timezone: user.timezone,
    profileComplete: profileComplete(user)
  };
}

function buildOrgPayload(body, ownerUserId, status = 'pending') {
  const name = String(body.name || body.organizationName || '').trim();
  const slug = normalizeSlug(body.slug || name);
  if (!name || !slug) {
    const error = new Error('Missing required organization name or slug');
    error.statusCode = 400;
    throw error;
  }
  return {
    name,
    slug,
    ownerUserId,
    city: body.city || body.address?.city || 'Hyderabad',
    status,
    billingContact: body.billingContact || {},
    contact: body.contact || {},
    address: body.address || {},
    businessDetails: body.businessDetails || {},
    branding: body.branding || {},
    settings: {
      ...(body.settings || {}),
      timezone: body.timezone || body.settings?.timezone || 'Asia/Kolkata',
      workingHours: body.workingHours || body.settings?.workingHours
    }
  };
}

exports.platformStatus = async (req, res) => {
  const organizations = await Organization.countDocuments({ status: { $ne: 'archived' } });
  res.json({ needsSetup: organizations === 0, organizations });
};

exports.currentUser = async (req, res) => {
  const user = await User.findOne({ clerkUserId: req.auth.userId }).lean();
  const organizations = await Organization.countDocuments({ status: { $ne: 'archived' } });
  res.json({
    exists: Boolean(user),
    needsSetup: organizations === 0,
    user: user ? serializeUser(user) : null
  });
};

exports.syncClerkUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const clerkUserId = req.auth.userId;

    if (!clerkUserId || !email) {
      return res.status(400).json({ error: 'clerkUserId and email are required' });
    }

    const user = await User.findOne({ clerkUserId }).lean();

    if (!user) {
      return res.status(409).json({
        error: 'Account type required',
        next: '/register'
      });
    }

    return res.status(200).json(serializeUser(user));
  } catch (error) {
    console.error('Sync user error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    return res.status(500).json({ error: 'Failed to sync user' });
  }
};

exports.createCustomerAccount = async (req, res) => {
  try {
    const organizations = await Organization.find({ status: 'active' }).sort({ createdAt: 1 }).limit(1);
    if (!organizations.length) {
      return res.status(409).json({ error: 'Platform setup is required before customer signup', next: '/setup' });
    }

    const email = String(req.body.email || req.auth.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOneAndUpdate(
      { clerkUserId: req.auth.userId },
      {
        $setOnInsert: {
          clerkUserId: req.auth.userId,
          email,
          balance: 1000,
          status: 'ACTIVE'
        },
        $set: {
          name: (req.body.name || 'Bus User').trim(),
          phone: (req.body.phone || 'N/A').trim(),
          role: 'customer',
          organizationId: organizations[0]._id
        }
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    res.status(201).json(serializeUser(user));
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'A user with this email already exists' });
    console.error('createCustomerAccount error:', error);
    res.status(500).json({ error: 'Failed to create customer account' });
  }
};

exports.createFirstRunSetup = async (req, res) => {
  try {
    const organizations = await Organization.countDocuments({ status: { $ne: 'archived' } });
    if (organizations > 0) {
      return res.status(409).json({ error: 'Setup is already complete' });
    }

    const email = String(req.body.email || req.auth.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'Administrator email is required' });

    const temporaryOwnerId = new Organization()._id;
    const organization = await Organization.create(buildOrgPayload(req.body, temporaryOwnerId, 'active'));
    const user = await User.create({
      clerkUserId: req.auth.userId,
      name: req.body.adminName || req.body.name || 'Organization Owner',
      email,
      phone: req.body.phone || 'N/A',
      role: 'org_owner',
      balance: 1000,
      organizationId: organization._id,
      status: 'ACTIVE',
      department: req.body.department || 'Administration',
      designation: req.body.designation || 'Organization Owner',
      employeeId: req.body.employeeId || null,
      language: req.body.language || 'en',
      timezone: req.body.timezone || 'Asia/Kolkata',
      emergencyContact: req.body.emergencyContact || {},
      address: req.body.adminAddress || req.body.address || {}
    });
    organization.ownerUserId = user._id;
    await organization.save();

    res.status(201).json({ organization, user: serializeUser(user), redirectTo: '/organization' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    if (error.code === 11000) return res.status(400).json({ error: 'Organization slug or user email already exists' });
    console.error('createFirstRunSetup error:', error);
    res.status(500).json({ error: 'Failed to complete setup' });
  }
};

exports.createOwnerOrganization = async (req, res) => {
  try {
    const email = String(req.body.email || req.auth.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ clerkUserId: req.auth.userId });
    const temporaryOwnerId = new Organization()._id;
    const organization = await Organization.create(buildOrgPayload(req.body, user?._id || temporaryOwnerId, user?.role === 'super_admin' ? 'active' : 'pending'));

    if (!user) {
      user = await User.create({
        clerkUserId: req.auth.userId,
        name: req.body.adminName || req.body.name || 'Organization Owner',
        email,
        phone: req.body.phone || 'N/A',
        role: 'org_owner',
        balance: 1000,
        organizationId: organization._id
      });
      organization.ownerUserId = user._id;
      await organization.save();
    } else if (user.role !== 'super_admin') {
      user.role = 'org_owner';
      user.organizationId = organization._id;
      await user.save();
      organization.ownerUserId = user._id;
      await organization.save();
    }

    res.status(201).json({ organization, user: serializeUser(user), redirectTo: organization.status === 'active' ? '/organization' : '/organization' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    if (error.code === 11000) return res.status(400).json({ error: 'Organization slug or user email already exists' });
    console.error('createOwnerOrganization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

exports.validateInvite = async (req, res) => {
  const invite = await OrganizationInvite.findOne({ tokenHash: tokenHash(req.params.token) })
    .populate('organizationId', 'name status')
    .select('-tokenHash')
    .lean();
  if (!invite || invite.status !== 'pending') return res.status(400).json({ valid: false, error: 'Invalid invite' });
  if (new Date() > invite.expiresAt) return res.status(400).json({ valid: false, error: 'Invite expired' });
  if (!EMPLOYEE_ROLES.includes(invite.role)) return res.status(400).json({ valid: false, error: 'Invite role is not an employee role' });
  if (!invite.organizationId || invite.organizationId.status !== 'active') {
    return res.status(400).json({ valid: false, error: 'Organization is not active' });
  }
  res.json({
    valid: true,
    invite: {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      organization: {
        name: invite.organizationId?.name || null,
        status: invite.organizationId?.status || null
      }
    }
  });
};

exports.acceptInviteForNewUser = async (req, res) => {
  try {
    const invite = await OrganizationInvite.findOne({ tokenHash: tokenHash(req.params.token) });
    if (!invite || invite.status !== 'pending') return res.status(400).json({ error: 'Invalid invite' });
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ error: 'Invite expired' });
    }
    if (!EMPLOYEE_ROLES.includes(invite.role)) return res.status(400).json({ error: 'Invite role is not allowed' });

    const email = String(req.body.email || req.auth.email || '').toLowerCase().trim();
    if (email !== invite.email) return res.status(400).json({ error: 'Signed-in email does not match invite' });
    const organization = await Organization.findById(invite.organizationId);
    if (!organization || organization.status !== 'active') return res.status(400).json({ error: 'Organization is not active' });

    const user = await User.findOneAndUpdate(
      { clerkUserId: req.auth.userId },
      {
        $setOnInsert: {
          clerkUserId: req.auth.userId,
          email,
          balance: 1000
        },
        $set: {
          name: req.body.name || 'Team Member',
          phone: req.body.phone || 'N/A',
          organizationId: invite.organizationId,
          role: invite.role,
          status: 'ACTIVE',
          department: req.body.department || null,
          designation: req.body.designation || null,
          employeeId: req.body.employeeId || null
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    invite.status = 'accepted';
    invite.acceptedBy = user._id;
    invite.acceptedAt = new Date();
    await invite.save();

    res.status(201).json({ user: serializeUser(user), redirectTo: `/${invite.role === 'price_manager' ? 'pricing' : invite.role.replace('_manager', '').replace('org_admin', 'organization')}` });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'A user with this email already exists' });
    console.error('acceptInviteForNewUser error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};

exports.completeProfile = async (req, res) => {
  const update = {
    avatar: req.body.avatar || null,
    phone: req.body.phone || 'N/A',
    emergencyContact: req.body.emergencyContact || {},
    address: req.body.address || {},
    language: req.body.language || 'en',
    timezone: req.body.timezone || 'Asia/Kolkata',
    department: req.body.department || null,
    employeeId: req.body.employeeId || null,
    designation: req.body.designation || null,
    metadata: {
      ...(req.body.metadata || {}),
      drivingLicense: req.body.drivingLicense || req.body.metadata?.drivingLicense || null,
      businessInfoCompleted: Boolean(req.body.businessInfoCompleted)
    }
  };
  const user = await User.findOneAndUpdate({ clerkUserId: req.auth.userId }, { $set: update }, { new: true, runValidators: true }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(serializeUser(user));
};
