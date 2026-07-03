/**
 * Migration: TASK-008 Translate role strings
 * 
 * This script:
 * 1. Translates old role strings to new ones:
 *    - user -> customer
 *    - admin -> conductor
 *    - fare_manager -> price_manager
 * 2. Logs each change to AuditLog for rollback traceability
 * 3. Is idempotent - safe to run multiple times
 * 
 * Usage: node migrations/002_translate_roles.js
 * 
 * Rollback: node migrations/002_translate_roles.js --rollback
 *           (reads AuditLog entries and reverses the translations)
 */

const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const ROLE_TRANSLATION = {
  'user': 'customer',
  'admin': 'conductor',
  'fare_manager': 'price_manager'
};

async function migrate() {
  try {
    console.log('\n=== Starting Role Translation Migration ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Find all users with old role strings
    const usersToMigrate = await User.find({ 
      role: { $in: Object.keys(ROLE_TRANSLATION) } 
    });
    
    console.log(`\n✓ Found ${usersToMigrate.length} users with old role strings`);
    
    let translatedCount = 0;
    const translationLog = [];

    for (const user of usersToMigrate) {
      const oldRole = user.role;
      const newRole = ROLE_TRANSLATION[oldRole];

      // Update user
      await User.updateOne(
        { _id: user._id },
        { $set: { role: newRole } }
      );

      // Log to AuditLog for rollback traceability
      const logEntry = await AuditLog.create({
        organizationId: user.organizationId || null,
        actorId: null, // System migration, no actor
        action: 'role_migration',
        targetType: 'User',
        targetId: user._id,
        before: { role: oldRole },
        after: { role: newRole },
        metadata: {
          migrationBatch: 'role_translation_v1',
          timestamp: new Date().toISOString()
        }
      });

      translationLog.push({
        userId: user._id,
        email: user.email,
        oldRole,
        newRole,
        auditLogId: logEntry._id
      });

      translatedCount++;
      
      if (translatedCount % 10 === 0) {
        console.log(`  ... ${translatedCount} users translated`);
      }
    }

    // Verify translation completed
    const remainingOldRoles = await User.countDocuments({ 
      role: { $in: Object.keys(ROLE_TRANSLATION) } 
    });

    console.log('\n=== Verification ===');
    console.log(`✓ Users translated: ${translatedCount}`);
    console.log(`✓ Audit log entries created: ${translationLog.length}`);
    console.log(`✓ Remaining old roles: ${remainingOldRoles} (should be 0)`);

    if (remainingOldRoles === 0) {
      console.log('\n✓ Migration completed successfully!\n');
      console.log('Translation summary:');
      console.log(`  - user -> customer: ${translationLog.filter(l => l.oldRole === 'user').length}`);
      console.log(`  - admin -> conductor: ${translationLog.filter(l => l.oldRole === 'admin').length}`);
      console.log(`  - fare_manager -> price_manager: ${translationLog.filter(l => l.oldRole === 'fare_manager').length}`);
      console.log('\nAll changes logged to AuditLog for rollback traceability.\n');
    } else {
      throw new Error('Migration incomplete: some old role strings remain');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function rollback() {
  try {
    console.log('\n=== Starting Rollback ===\n');
    
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Find all role migration audit logs
    const migrationLogs = await AuditLog.find({ 
      action: 'role_migration',
      targetType: 'User'
    });

    console.log(`\n✓ Found ${migrationLogs.length} migration log entries\n`);

    let rollbackCount = 0;

    for (const log of migrationLogs) {
      const oldRole = log.before.role;
      
      // Restore old role
      await User.updateOne(
        { _id: log.targetId },
        { $set: { role: oldRole } }
      );

      rollbackCount++;
      
      if (rollbackCount % 10 === 0) {
        console.log(`  ... ${rollbackCount} users restored`);
      }
    }

    // Delete audit logs to avoid confusion
    await AuditLog.deleteMany({ 
      action: 'role_migration',
      targetType: 'User'
    });

    console.log(`\n✓ Rollback completed!`);
    console.log(`✓ Users restored: ${rollbackCount}`);
    console.log(`✓ Audit logs deleted: ${migrationLogs.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Check for rollback flag
if (process.argv.includes('--rollback')) {
  rollback();
} else {
  migrate();
}
