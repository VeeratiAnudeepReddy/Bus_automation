/**
 * Migration: TASK-004 Backfill default organization
 * 
 * This script:
 * 1. Creates a default Organization if it doesn't exist
 * 2. Backfills organizationId on all existing rows (User, Route, Ticket, FareHistory)
 * 3. Is idempotent - safe to run multiple times
 * 
 * Usage: node migrations/001_backfill_default_org.js
 * 
 * Rollback: node migrations/001_backfill_default_org.js --rollback
 *           (or manually unset organizationId and drop Organization collection)
 */

const mongoose = require('mongoose');
const config = require('../config');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket');
const FareHistory = require('../models/FareHistory');

async function migrate() {
  try {
    console.log('\n=== Starting Backfill Migration ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Check if already migrated
    const existingOrg = await Organization.findOne({ slug: 'default' });
    let defaultOrg;
    
    if (existingOrg) {
      console.log('✓ Default organization already exists');
      defaultOrg = existingOrg;
    } else {
      // Create default organization
      defaultOrg = await Organization.create({
        name: 'Default Organization',
        slug: 'default',
        city: 'Hyderabad',
        status: 'active',
        // Use the first admin or create a placeholder owner
        // For initial migration, we use a special marker that will be fixed after org onboarding is live
        ownerUserId: new mongoose.Types.ObjectId()
      });
      console.log('✓ Created default organization:', defaultOrg._id);
    }

    // Backfill User collection
    const usersResult = await User.updateMany(
      { organizationId: null },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log(`✓ Updated ${usersResult.modifiedCount} users`);

    // Backfill Route collection
    const routesResult = await Route.updateMany(
      { organizationId: null },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log(`✓ Updated ${routesResult.modifiedCount} routes`);

    // Backfill Ticket collection
    const ticketsResult = await Ticket.updateMany(
      { organizationId: null },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log(`✓ Updated ${ticketsResult.modifiedCount} tickets`);

    // Backfill FareHistory collection
    const fareHistoryResult = await FareHistory.updateMany(
      { organizationId: null },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log(`✓ Updated ${fareHistoryResult.modifiedCount} fare history records`);

    // Verify backfill completed
    const nullUsers = await User.countDocuments({ organizationId: null });
    const nullRoutes = await Route.countDocuments({ organizationId: null });
    const nullTickets = await Ticket.countDocuments({ organizationId: null });
    const nullFareHistory = await FareHistory.countDocuments({ organizationId: null });

    console.log('\n=== Verification ===');
    console.log(`✓ Null organizationId in User: ${nullUsers} (should be 0)`);
    console.log(`✓ Null organizationId in Route: ${nullRoutes} (should be 0)`);
    console.log(`✓ Null organizationId in Ticket: ${nullTickets} (should be 0)`);
    console.log(`✓ Null organizationId in FareHistory: ${nullFareHistory} (should be 0)`);

    if (nullUsers === 0 && nullRoutes === 0 && nullTickets === 0 && nullFareHistory === 0) {
      console.log('\n✓ Migration completed successfully!\n');
    } else {
      throw new Error('Backfill incomplete: some null organizationId values remain');
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

    // Remove organizationId from all documents
    const usersResult = await User.updateMany({}, { $unset: { organizationId: '' } });
    console.log(`✓ Unset organizationId from ${usersResult.modifiedCount} users`);

    const routesResult = await Route.updateMany({}, { $unset: { organizationId: '' } });
    console.log(`✓ Unset organizationId from ${routesResult.modifiedCount} routes`);

    const ticketsResult = await Ticket.updateMany({}, { $unset: { organizationId: '' } });
    console.log(`✓ Unset organizationId from ${ticketsResult.modifiedCount} tickets`);

    const fareHistoryResult = await FareHistory.updateMany({}, { $unset: { organizationId: '' } });
    console.log(`✓ Unset organizationId from ${fareHistoryResult.modifiedCount} fare history records`);

    // Drop default organization
    await Organization.deleteOne({ slug: 'default' });
    console.log('✓ Dropped default organization');

    console.log('\n✓ Rollback completed!\n');

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
