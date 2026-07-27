/**
 * Migration 004 — Repair user tenancy & safe role cleanup
 *
 * Evidence (2026-07-27 runtime audit):
 * - 4/6 users missing organizationId despite default org existing
 * - 2 users with null role; 1 with legacy `user`; 1 with legacy `admin`
 *
 * Safe actions (auto):
 * 1. Backfill organizationId → default org for null/missing
 * 2. Set null/missing role → customer
 * 3. Translate user → customer (logged to AuditLog)
 *
 * Explicitly NOT auto-translated:
 * - admin → conductor (may be an org operator; see open question Q1)
 *
 * Usage: node migrations/004_repair_user_tenancy.js
 * Idempotent.
 */

const mongoose = require('mongoose');
const config = require('../config');
const Organization = require('../models/Organization');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function migrate() {
  try {
    console.log('\n=== Migration 004: Repair user tenancy ===\n');
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const defaultOrg = await Organization.findOneAndUpdate(
      { slug: 'default' },
      {
        $setOnInsert: {
          name: 'Default Organization',
          slug: 'default',
          city: 'Hyderabad',
          status: 'active',
          ownerUserId: new mongoose.Types.ObjectId()
        }
      },
      { upsert: true, new: true }
    );
    console.log('Default org:', defaultOrg._id.toString());

    const orgBackfill = await User.updateMany(
      { $or: [{ organizationId: null }, { organizationId: { $exists: false } }] },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log(`Backfilled organizationId on ${orgBackfill.modifiedCount} users`);

    const nullRoleFix = await User.updateMany(
      { $or: [{ role: null }, { role: { $exists: false } }] },
      { $set: { role: 'customer' } }
    );
    console.log(`Set null role → customer on ${nullRoleFix.modifiedCount} users`);

    const legacyUsers = await User.find({ role: 'user' });
    let translated = 0;
    for (const user of legacyUsers) {
      await User.updateOne({ _id: user._id }, { $set: { role: 'customer' } });
      await AuditLog.create({
        organizationId: user.organizationId || defaultOrg._id,
        actorId: null,
        action: 'role_migration',
        targetType: 'User',
        targetId: user._id,
        before: { role: 'user' },
        after: { role: 'customer' },
        metadata: { migrationBatch: 'repair_user_tenancy_v4' }
      });
      translated += 1;
    }
    console.log(`Translated user → customer: ${translated}`);

    const remainingAdmins = await User.find({ role: 'admin' }).select('_id email name role').lean();
    if (remainingAdmins.length) {
      console.log('\n⚠ Left legacy admin roles untouched (manual decision required):');
      for (const u of remainingAdmins) {
        console.log(`  - ${u._id} ${u.email || u.name || '(no email)'} role=admin`);
      }
    }

    const stillMissingOrg = await User.countDocuments({
      $or: [{ organizationId: null }, { organizationId: { $exists: false } }]
    });
    const stillNullRole = await User.countDocuments({
      $or: [{ role: null }, { role: { $exists: false } }]
    });
    const stillUserRole = await User.countDocuments({ role: 'user' });

    console.log('\n=== Verification ===');
    console.log(`Users missing organizationId: ${stillMissingOrg} (expect 0)`);
    console.log(`Users with null role: ${stillNullRole} (expect 0)`);
    console.log(`Users with role=user: ${stillUserRole} (expect 0)`);

    if (stillMissingOrg || stillNullRole || stillUserRole) {
      throw new Error('Migration 004 incomplete');
    }

    console.log('\n✓ Migration 004 completed\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration 004 failed:', error.message);
    console.error(error.stack);
    try {
      await mongoose.connection.close();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
}

migrate();
