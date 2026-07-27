/**
 * Permission middleware for role-based access control
 * 
 * This provides composable permission checks:
 * - requireRole(...allowedRoles): checks if user has one of the specified roles
 * - requireOrgScope(): checks if user belongs to the organization being accessed
 * - requireSuperAdmin(): bypasses org scoping, requires super_admin role
 */

// New role enum - full 13-role hierarchy from 07_Role_Hierarchy.md
const ALL_ROLES = [
  'super_admin',        // 1. Platform-wide super admin
  'org_owner',          // 2. Organization owner
  'org_admin',          // 3. Organization admin
  'regional_admin',     // 3. Regional admin (reserved, not implemented)
  'depot_manager',      // 4. Depot manager (reserved, not implemented)
  'fleet_manager',      // 5. Fleet manager (reserved, not implemented)
  'price_manager',      // 6. Pricing manager (new name for fare_manager)
  'finance_manager',    // 7. Finance manager (new)
  'operations_manager', // 8. Operations manager (reserved, not implemented)
  'dispatcher',         // 9. Dispatcher (reserved, not implemented)
  'scheduler',
  'bus_manager',
  'driver',             // 10. Driver (reserved, not implemented)
  'conductor',          // 11. Conductor (new name for admin/scanner role)
  'support',            // 12. Support (new)
  'customer'            // 13. Customer (new name for user)
];

// Old role names for backward compatibility during transition
const OLD_ROLES = ['admin', 'fare_manager', 'user'];
const ROLE_TRANSLATION_MAP = {
  'admin': 'conductor',
  'fare_manager': 'price_manager',
  'user': 'customer'
};

/**
 * requireRole(...allowedRoles)
 * 
 * Checks if the user has one of the specified roles.
 * Supports both old and new role strings during transition window.
 * 
 * Usage: app.get('/admin/analytics', requireRole('conductor', 'org_owner', 'super_admin'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role;
    const normalizedUserRole = ROLE_TRANSLATION_MAP[userRole] || userRole;
    
    const allowed = allowedRoles.some(role => {
      const normalizedRole = ROLE_TRANSLATION_MAP[role] || role;
      return normalizedUserRole === normalizedRole || userRole === role;
    });

    if (!allowed) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `User role "${userRole}" is not authorized for this action`
      });
    }

    next();
  };
}

/**
 * requireOrgScope()
 * 
 * Checks if the user belongs to the organization being accessed.
 * Extracts organizationId from req.params or req.body and compares with req.user.organizationId.
 * Super admins bypass this check.
 * 
 * Usage: app.get('/api/organizations/:id', requireOrgScope(), handler)
 */
function requireOrgScope() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Super admins bypass org scope checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Extract organizationId from various sources
    let targetOrgId = null;
    
    // Try params first (e.g., /organizations/:id)
    if (req.params.id) {
      targetOrgId = req.params.id;
    }
    // Then try organizationId in query
    else if (req.query.organizationId) {
      targetOrgId = req.query.organizationId;
    }
    // For list operations, req.organizationId is set by middleware
    else if (req.organizationId) {
      targetOrgId = req.organizationId;
    }

    if (!targetOrgId) {
      // If no target org specified, assume current user's org
      req.organizationId = req.user.organizationId;
      return next();
    }

    // Compare user's org with target org
    if (targetOrgId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'User does not have access to this organization'
      });
    }

    req.organizationId = targetOrgId;
    next();
  };
}

/**
 * requireSuperAdmin()
 * 
 * Requires user to have super_admin role.
 * Bypasses org scoping entirely.
 * 
 * Usage: app.post('/api/organizations/:id/approve', requireSuperAdmin(), handler)
 */
function requireSuperAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'This action requires super admin privileges'
      });
    }

    next();
  };
}

/**
 * orgContextMiddleware()
 * 
 * Extracts organizationId from the user record and attaches to req for use in handlers.
 * Runs on all requests after auth middleware.
 * 
 * Usage: app.use(authMiddleware, orgContextMiddleware(), ...)
 */
function orgContextMiddleware() {
  return (req, res, next) => {
    if (req.user && req.user.organizationId) {
      req.organizationId = req.user.organizationId;
    }
    next();
  };
}

module.exports = {
  requireRole,
  requireOrgScope,
  requireSuperAdmin,
  orgContextMiddleware,
  ALL_ROLES,
  OLD_ROLES,
  ROLE_TRANSLATION_MAP
};
