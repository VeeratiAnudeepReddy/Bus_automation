/**
 * Organization Routes
 * 
 * Authenticated organization endpoints:
 * GET /api/organizations - List available organizations
 * POST /api/organizations - Create new organization
 * GET /api/organizations/:id - Get organization details
 * GET /api/organizations/:id/dashboard - Get organization dashboard
 * GET /api/organizations/:id/members - Get organization members
 * POST /api/organizations/:id/switch - Select organization context
 * 
 * Org manager endpoints:
 * PATCH /api/organizations/:id - Update organization
 * POST /api/organizations/:id/invites - Send invite
 * GET /api/organizations/:id/invites - List invites
 * DELETE /api/organizations/:id/invites/:inviteId - Cancel invite
 * DELETE /api/organizations/:id - Archive organization
 * 
 * Super admin endpoints:
 * POST /api/organizations/:id/approve - Approve pending org
 * POST /api/organizations/:id/suspend - Suspend organization
 * 
 * Public invite acceptance:
 * POST /api/invites/:token/accept - Accept invite after signup
 */

const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole, requireSuperAdmin } = require('../middleware/permissions');

const requireOrgManager = requireRole('org_owner', 'org_admin', 'super_admin');

router.get('/organizations', requireAuth, organizationController.listOrganizations);

/**
 * Create organization
 * Any authenticated user can create ONE organization
 * POST /api/organizations
 */
router.post('/organizations', requireAuth, organizationController.createOrganization);

/**
 * Get organization details
 * Only org members or super_admin
 * GET /api/organizations/:id
 */
router.get('/organizations/:id', requireAuth, organizationController.getOrganization);

router.get('/organizations/:id/dashboard', requireAuth, organizationController.getOrganizationDashboard);

router.get('/organizations/:id/members', requireAuth, organizationController.listMembers);

router.post('/organizations/:id/switch', requireAuth, organizationController.switchOrganization);

/**
 * Update organization
 * Only org_owner
 * PATCH /api/organizations/:id
 */
router.patch(
  '/organizations/:id',
  requireAuth,
  requireOrgManager,
  organizationController.updateOrganization
);

router.delete(
  '/organizations/:id',
  requireAuth,
  requireOrgManager,
  organizationController.archiveOrganization
);

/**
 * Super admin approves pending organization
 * Only super_admin
 * POST /api/organizations/:id/approve
 */
router.post(
  '/organizations/:id/approve',
  requireAuth,
  requireSuperAdmin(),
  organizationController.approveOrganization
);

/**
 * Super admin suspends organization
 * Only super_admin
 * POST /api/organizations/:id/suspend
 */
router.post(
  '/organizations/:id/suspend',
  requireAuth,
  requireSuperAdmin(),
  organizationController.suspendOrganization
);

/**
 * Org owner sends invite to team member
 * Only org_owner
 * POST /api/organizations/:id/invites
 */
router.post(
  '/organizations/:id/invites',
  requireAuth,
  requireOrgManager,
  organizationController.sendInvite
);

router.get(
  '/organizations/:id/invites',
  requireAuth,
  requireOrgManager,
  organizationController.listInvites
);

router.delete(
  '/organizations/:id/invites/:inviteId',
  requireAuth,
  requireOrgManager,
  organizationController.cancelInvite
);

/**
 * Accept invite after Clerk signup
 * Any authenticated user with matching email
 * POST /api/invites/:token/accept
 */
router.post('/invites/:token/accept', requireAuth, organizationController.acceptInvite);

module.exports = router;
