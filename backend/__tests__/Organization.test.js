const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const OrganizationInvite = require('../models/OrganizationInvite');

describe('Organization Model', () => {
  describe('Schema validation', () => {
    test('defines required organization fields', () => {
      expect(Organization.schema.path('name').isRequired).toBe(true);
      expect(Organization.schema.path('slug').isRequired).toBe(true);
      expect(Organization.schema.path('ownerUserId').isRequired).toBe(true);
    });

    test('uses default values for city and status', () => {
      const org = new Organization({
        name: 'Test Company',
        slug: 'test-company',
        ownerUserId: new mongoose.Types.ObjectId()
      });

      expect(org.city).toBe('Hyderabad');
      expect(org.status).toBe('pending');
    });

    test('rejects invalid status enum value', async () => {
      const org = new Organization({
        name: 'Test Company',
        slug: 'test-company',
        ownerUserId: new mongoose.Types.ObjectId(),
        status: 'invalid_status'
      });

      await expect(org.validate()).rejects.toThrow();
    });

    test('defines organization profile, branding, settings, and subscription defaults', () => {
      const org = new Organization({
        name: 'Metro Transit',
        slug: 'metro-transit',
        ownerUserId: new mongoose.Types.ObjectId()
      });

      expect(org.address.city).toBe('Hyderabad');
      expect(org.address.state).toBe('Telangana');
      expect(org.businessDetails.gstNumber).toBeNull();
      expect(org.branding.primaryColor).toBe('#111827');
      expect(org.branding.secondaryColor).toBe('#f59e0b');
      expect(org.settings.timezone).toBe('Asia/Kolkata');
      expect(org.settings.currency).toBe('INR');
      expect(org.subscription.plan).toBe('trial');
    });

    test('rejects invalid branding color values', async () => {
      const org = new Organization({
        name: 'Metro Transit',
        slug: 'metro-transit',
        ownerUserId: new mongoose.Types.ObjectId(),
        branding: { primaryColor: 'blue' }
      });

      await expect(org.validate()).rejects.toThrow();
    });

    test('rejects invalid slug format', async () => {
      const org = new Organization({
        name: 'Test Company',
        slug: 'Invalid Slug',
        ownerUserId: new mongoose.Types.ObjectId()
      });

      await expect(org.validate()).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    test('defines a unique slug index', () => {
      const indexes = Organization.schema.indexes();
      expect(indexes).toEqual(
        expect.arrayContaining([
          [{ slug: 1 }, expect.objectContaining({ unique: true })]
        ])
      );
    });

    test('defines status and createdAt index for admin listing', () => {
      const indexes = Organization.schema.indexes();
      expect(indexes).toEqual(
        expect.arrayContaining([
          [{ status: 1, createdAt: -1 }, expect.any(Object)]
        ])
      );
    });

    test('defines city status index for organization filtering', () => {
      const indexes = Organization.schema.indexes();
      expect(indexes).toEqual(
        expect.arrayContaining([
          [{ city: 1, status: 1, createdAt: -1 }, expect.any(Object)]
        ])
      );
    });
  });

  describe('OrganizationInvite model', () => {
    test('requires persistent invite fields', () => {
      expect(OrganizationInvite.schema.path('organizationId').isRequired).toBe(true);
      expect(OrganizationInvite.schema.path('email').isRequired).toBe(true);
      expect(OrganizationInvite.schema.path('role').isRequired).toBe(true);
      expect(OrganizationInvite.schema.path('tokenHash').isRequired).toBe(true);
      expect(OrganizationInvite.schema.path('invitedBy').isRequired).toBe(true);
      expect(OrganizationInvite.schema.path('expiresAt').isRequired).toBe(true);
    });

    test('defaults invite status to pending', () => {
      const invite = new OrganizationInvite({
        organizationId: new mongoose.Types.ObjectId(),
        email: 'Member@Example.com',
        role: 'conductor',
        tokenHash: 'hash',
        invitedBy: new mongoose.Types.ObjectId(),
        expiresAt: new Date()
      });

      expect(invite.email).toBe('member@example.com');
      expect(invite.status).toBe('pending');
    });

    test('defines invite lookup indexes', () => {
      const indexes = OrganizationInvite.schema.indexes();
      expect(indexes).toEqual(
        expect.arrayContaining([
          [{ organizationId: 1, status: 1, createdAt: -1 }, expect.any(Object)],
          [{ organizationId: 1, email: 1, status: 1 }, expect.any(Object)]
        ])
      );
    });
  });
});
