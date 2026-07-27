const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

describe('Enterprise User Management model', () => {
  test('defines additive enterprise profile fields with defaults', () => {
    const user = new User({
      name: 'Operations User',
      email: 'Ops@Example.com',
      organizationId: new mongoose.Types.ObjectId()
    });

    expect(user.email).toBe('ops@example.com');
    expect(user.status).toBe('ACTIVE');
    expect(user.isActive).toBe(true);
    expect(user.isDeleted).toBe(false);
    expect(user.address.city).toBe('Hyderabad');
    expect(user.address.state).toBe('Telangana');
    expect(user.language).toBe('en');
    expect(user.timezone).toBe('Asia/Kolkata');
    expect(user.notificationSettings.email).toBe(true);
  });

  test('supports all enterprise user statuses', async () => {
    const statuses = ['ACTIVE', 'PENDING', 'INVITED', 'SUSPENDED', 'DEACTIVATED', 'ARCHIVED'];

    for (const status of statuses) {
      const user = new User({
        name: `User ${status}`,
        email: `${status.toLowerCase()}@example.com`,
        organizationId: new mongoose.Types.ObjectId(),
        status
      });
      await expect(user.validate()).resolves.toBeUndefined();
    }
  });

  test('rejects invalid enterprise user status', async () => {
    const user = new User({
      name: 'Invalid User',
      email: 'invalid@example.com',
      organizationId: new mongoose.Types.ObjectId(),
      status: 'offline'
    });

    await expect(user.validate()).rejects.toThrow();
  });

  test('defines organization user management indexes', () => {
    const indexes = User.schema.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ organizationId: 1, role: 1, createdAt: -1 }, expect.any(Object)],
        [{ organizationId: 1, status: 1, createdAt: -1 }, expect.any(Object)],
        [{ organizationId: 1, employeeId: 1 }, expect.objectContaining({ sparse: true })],
        [{ organizationId: 1, isActive: 1, isDeleted: 1 }, expect.any(Object)]
      ])
    );
  });

  test('audit log allows user management actions', async () => {
    const log = new AuditLog({
      organizationId: new mongoose.Types.ObjectId(),
      actorId: new mongoose.Types.ObjectId(),
      action: 'user_suspended',
      targetType: 'User',
      targetId: new mongoose.Types.ObjectId()
    });

    await expect(log.validate()).resolves.toBeUndefined();
  });
});
