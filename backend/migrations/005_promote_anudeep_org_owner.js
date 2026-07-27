/**
 * Migration 005 — Promote anudeepreddy016@gmail.com to org_owner
 *
 * Confirmed before write (Atlas busticket, 2026-07-27):
 *   userId: 69d37a8f04896339c5c0d438
 *   organizationId: 6a4783e7b2c7aceb7801c063 (Default Organization, slug=default)
 *   before role: admin
 *
 * Does NOT grant super_admin.
 *
 * Usage: node migrations/005_promote_anudeep_org_owner.js
 */

const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const TARGET_EMAIL = 'anudeepreddy016@gmail.com';
const CONFIRMED_ORG_ID = '6a4783e7b2c7aceb7801c063';

async function migrate() {
  try {
    console.log('\n=== Migration 005: Promote test user to org_owner ===\n');
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      throw new Error(`User not found: ${TARGET_EMAIL}`);
    }

    const before = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ? String(user.organizationId) : null
    };

    if (!user.organizationId) {
      throw new Error('organizationId missing — run migration 004 first');
    }

    if (String(user.organizationId) !== CONFIRMED_ORG_ID) {
      throw new Error(
        `Refusing to proceed: organizationId ${user.organizationId} != confirmed ${CONFIRMED_ORG_ID}`
      );
    }

    const org = await Organization.findById(user.organizationId);
    if (!org || org.status !== 'active') {
      throw new Error('Confirmed organization missing or not active');
    }

    const afterRole = 'org_owner';
    await User.updateOne({ _id: user._id }, { $set: { role: afterRole } });

    // Bind org ownership to this test owner when previous owner was a placeholder ObjectId.
    const previousOwnerId = org.ownerUserId ? String(org.ownerUserId) : null;
    if (previousOwnerId !== String(user._id)) {
      await Organization.updateOne({ _id: org._id }, { $set: { ownerUserId: user._id } });
    }

    const audit = await AuditLog.create({
      organizationId: user.organizationId,
      actorId: null,
      action: 'role_migration',
      targetType: 'User',
      targetId: user._id,
      before: { role: before.role, organizationId: before.organizationId },
      after: { role: afterRole, organizationId: before.organizationId, ownerUserId: String(user._id) },
      metadata: {
        migrationBatch: 'promote_anudeep_org_owner_v5',
        reason: 'STATE_OF_PROJECT follow-up: test account scoped to Default Organization'
      }
    });

    logger.audit('role_promoted_org_owner', {
      userId: before.userId,
      email: before.email,
      beforeRole: before.role,
      afterRole,
      organizationId: before.organizationId,
      previousOwnerId,
      auditLogId: String(audit._id)
    });

    console.log('BEFORE', JSON.stringify(before, null, 2));
    console.log('AFTER ', JSON.stringify({
      userId: before.userId,
      email: before.email,
      role: afterRole,
      organizationId: before.organizationId,
      ownerUserId: String(user._id),
      auditLogId: String(audit._id)
    }, null, 2));

    const verify = await User.findById(user._id).lean();
    if (verify.role !== 'org_owner') throw new Error('Role update did not stick');
    if (verify.role === 'super_admin') throw new Error('Refusing super_admin');

    console.log('\n✓ Migration 005 completed\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration 005 failed:', error.message);
    try { await mongoose.connection.close(); } catch (_) { /* ignore */ }
    process.exit(1);
  }
}

migrate();
