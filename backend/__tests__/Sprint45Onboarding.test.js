const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const OrganizationInvite = require('../models/OrganizationInvite');
const User = require('../models/User');

describe('Sprint 4.5 onboarding and role routing foundations', () => {
  const organizationId = new mongoose.Types.ObjectId();
  const ownerId = new mongoose.Types.ObjectId();

  test('first-run setup can model an organization owner without manual role editing', async () => {
    const organization = new Organization({
      name: 'Metro Operator',
      slug: 'metro-operator',
      ownerUserId: ownerId,
      status: 'active',
      settings: { timezone: 'Asia/Kolkata' }
    });
    const owner = new User({
      name: 'Owner',
      email: 'owner@example.com',
      phone: '9999999999',
      role: 'org_owner',
      clerkUserId: 'user_owner',
      organizationId: organization._id,
      designation: 'Organization Owner',
      department: 'Administration'
    });

    await expect(organization.validate()).resolves.toBeUndefined();
    await expect(owner.validate()).resolves.toBeUndefined();
    expect(owner.role).toBe('org_owner');
  });

  test('customer signup remains explicit and lands in customer role', async () => {
    const customer = new User({
      name: 'Passenger',
      email: 'passenger@example.com',
      phone: '9999999999',
      role: 'customer',
      clerkUserId: 'user_customer',
      organizationId
    });

    await expect(customer.validate()).resolves.toBeUndefined();
    expect(customer.role).toBe('customer');
  });

  test('employee invite supports enterprise roles and expiry', async () => {
    const invite = new OrganizationInvite({
      organizationId,
      email: 'driver@example.com',
      role: 'driver',
      tokenHash: 'hash',
      invitedBy: ownerId,
      expiresAt: new Date(Date.now() + 3600000)
    });

    await expect(invite.validate()).resolves.toBeUndefined();
    expect(invite.status).toBe('pending');
    expect(invite.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('profile completion fields are supported on user schema', async () => {
    const user = new User({
      name: 'Finance User',
      email: 'finance@example.com',
      phone: '9999999999',
      role: 'finance_manager',
      clerkUserId: 'user_finance',
      organizationId,
      emergencyContact: { name: 'Contact', phone: '8888888888' },
      address: { line1: 'Depot Road', city: 'Hyderabad' },
      language: 'en',
      timezone: 'Asia/Kolkata',
      department: 'Finance',
      employeeId: 'FIN-1',
      designation: 'Finance Manager'
    });

    await expect(user.validate()).resolves.toBeUndefined();
    expect(user.department).toBe('Finance');
    expect(user.employeeId).toBe('FIN-1');
  });
});
