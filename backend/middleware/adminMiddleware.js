/**
 * Backward compatibility shim for existing middleware
 * 
 * These exports maintain the old API while delegating to the new permissions module.
 * This ensures existing code that imports these functions continues to work during
 * the transition to the new role hierarchy.
 * 
 * Old implementation -> New implementation:
 * - requireAdmin (gates ticket scanning, not org admin) -> conductor role + org members
 * - requireFareManagerOrAdmin -> price_manager or org_owner roles
 * 
 * Both functions accept both old and new role strings during the transition window.
 */

const { requireRole } = require('./permissions');

// requireAdmin: old implementation gated 'admin' role (used for ticket scanning)
// New implementation: requires 'conductor' (renamed from admin) OR 'org_owner' OR 'super_admin'
// Supports both old 'admin' and new 'conductor' role strings
exports.requireAdmin = requireRole('conductor', 'org_owner', 'super_admin');

// requireFareManagerOrAdmin: old implementation required 'admin' or 'fare_manager'
// New implementation: requires 'price_manager' (renamed from fare_manager) OR 'org_owner' OR 'super_admin'
// Supports both old and new role strings
exports.requireFareManagerOrAdmin = requireRole('price_manager', 'org_owner', 'super_admin');

