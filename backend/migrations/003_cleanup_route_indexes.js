/**
 * Migration: cleanup route indexes after organization scoping
 *
 * This script:
 * 1. Backfills missing Route.organizationId values to the default organization
 * 2. Drops the obsolete global route uniqueness index:
 *    city_1_fromNormalized_1_toNormalized_1
 * 3. Ensures the current organization-scoped route indexes exist
 *
 * Usage: node migrations/003_cleanup_route_indexes.js
 */

const mongoose = require('mongoose');
const config = require('../config');
const Route = require('../models/Route');
const { getDefaultOrganization } = require('../utils/defaultOrganization');

const LEGACY_ROUTE_UNIQUE_INDEX = 'city_1_fromNormalized_1_toNormalized_1';

async function migrate() {
  try {
    console.log('\n=== Starting Route Index Cleanup Migration ===\n');

    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    const defaultOrganization = await getDefaultOrganization();
    const routesResult = await Route.updateMany(
      { organizationId: null },
      { $set: { organizationId: defaultOrganization._id } }
    );
    console.log(`✓ Backfilled ${routesResult.modifiedCount} routes with default organization`);

    const indexes = await Route.collection.indexes();
    const legacyIndex = indexes.find((index) => index.name === LEGACY_ROUTE_UNIQUE_INDEX);

    if (legacyIndex) {
      await Route.collection.dropIndex(LEGACY_ROUTE_UNIQUE_INDEX);
      console.log(`✓ Dropped obsolete index: ${LEGACY_ROUTE_UNIQUE_INDEX}`);
    } else {
      console.log(`✓ Obsolete index not present: ${LEGACY_ROUTE_UNIQUE_INDEX}`);
    }

    await Route.syncIndexes();
    console.log('✓ Route indexes synchronized with schema');

    const currentIndexes = await Route.collection.indexes();
    console.log('\n=== Current Route Indexes ===');
    currentIndexes.forEach((index) => console.log(`✓ ${index.name}`));

    console.log('\n✓ Migration completed successfully!\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrate();
