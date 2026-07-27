const mongoose = require('mongoose');
const Organization = require('../models/Organization');

const DEFAULT_ORG_SLUG = 'default';

async function getDefaultOrganization() {
  return Organization.findOneAndUpdate(
    { slug: DEFAULT_ORG_SLUG },
    {
      $setOnInsert: {
        name: 'Default Organization',
        slug: DEFAULT_ORG_SLUG,
        city: 'Hyderabad',
        status: 'active',
        ownerUserId: new mongoose.Types.ObjectId()
      }
    },
    { new: true, upsert: true }
  );
}

async function resolveOrganizationId(user) {
  if (user?.organizationId) {
    return user.organizationId;
  }

  const organization = await getDefaultOrganization();

  // Persist heal so subsequent requests and requireOrgScope see a real org binding.
  if (user?._id) {
    const User = require('../models/User');
    await User.updateOne(
      { _id: user._id, $or: [{ organizationId: null }, { organizationId: { $exists: false } }] },
      { $set: { organizationId: organization._id } }
    );
    user.organizationId = organization._id;
  }

  return organization._id;
}

module.exports = {
  DEFAULT_ORG_SLUG,
  getDefaultOrganization,
  resolveOrganizationId
};
