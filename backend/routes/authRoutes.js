const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireClerkAuth } = require('../middleware/clerkJwt');

// POST /api/auth/sync
router.post('/auth/sync', requireClerkAuth, authController.syncClerkUser);
router.get('/auth/platform-status', authController.platformStatus);
router.get('/auth/me', requireClerkAuth, authController.currentUser);
router.post('/auth/customer', requireClerkAuth, authController.createCustomerAccount);
router.post('/auth/setup', requireClerkAuth, authController.createFirstRunSetup);
router.post('/auth/organization-owner', requireClerkAuth, authController.createOwnerOrganization);
router.get('/auth/invites/:token', authController.validateInvite);
router.post('/auth/invites/:token/accept', requireClerkAuth, authController.acceptInviteForNewUser);
router.patch('/auth/profile', requireClerkAuth, authController.completeProfile);

module.exports = router;
