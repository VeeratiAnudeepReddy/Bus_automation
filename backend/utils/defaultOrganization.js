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
  return organization._id;
}

module.exports = {
  DEFAULT_ORG_SLUG,
  getDefaultOrganization,
  resolveOrganizationId
};
