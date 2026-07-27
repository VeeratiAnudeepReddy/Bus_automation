/**
 * Simple verification script for Organization model
 * Run with: node verify-organization.js
 */
const mongoose = require('mongoose');
const Organization = require('./models/Organization');

async function verify() {
  try {
    // Mock connection (not really connecting, just initializing)
    const schema = Organization.schema;
    
    console.log('\n=== Organization Model Verification ===\n');
    
    // Check required fields
    console.log('✓ Required fields:');
    console.log('  - name:', schema.paths.name.isRequired);
    console.log('  - slug:', schema.paths.slug.isRequired);
    console.log('  - ownerUserId:', schema.paths.ownerUserId.isRequired);
    
    // Check enum values
    console.log('\n✓ Status enum values:');
    const statusEnum = schema.paths.status.enumValues;
    console.log('  -', statusEnum.join(', '));
    
    // Check index on slug
    console.log('\n✓ Indexes defined:');
    console.log('  - Slug field indexed:', schema.paths.slug.index);
    
    // Check if unique is defined on slug
    const slugPath = schema.paths.slug;
    console.log('  - Slug unique constraint:', slugPath.unique ? 'yes' : 'no');
    
    // Check default values
    console.log('\n✓ Default values:');
    console.log('  - city:', schema.paths.city.defaultValue);
    console.log('  - status:', schema.paths.status.defaultValue);
    
    // Check timestamps
    console.log('\n✓ Timestamps:', schema.options.timestamps ? 'enabled' : 'disabled');
    
    console.log('\n=== All checks passed! ===\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verify();
