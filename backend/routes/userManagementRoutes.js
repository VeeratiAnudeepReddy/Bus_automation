const express = require('express');
const router = express.Router();
const controller = require('../controllers/userManagementController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/users/export', requireAuth, controller.exportUsers);
router.get('/users/activity', requireAuth, controller.getUserActivity);
router.get('/users/search', requireAuth, controller.searchUsers);
router.post('/users/import', requireAuth, controller.importUsers);
router.post('/users/bulk', requireAuth, controller.bulkUsers);
router.get('/users', requireAuth, controller.listUsers);
router.post('/users', requireAuth, controller.createUser);
router.get('/users/:id', requireAuth, controller.getUser);
router.patch('/users/:id', requireAuth, controller.updateUser);
router.delete('/users/:id', requireAuth, controller.softDeleteUser);
router.post('/users/:id/archive', requireAuth, controller.archiveUser);
router.post('/users/:id/restore', requireAuth, controller.restoreUser);
router.post('/users/:id/suspend', requireAuth, controller.suspendUser);
router.post('/users/:id/activate', requireAuth, controller.activateUser);
router.post('/users/:id/role', requireAuth, controller.changeRole);
router.post('/users/:id/transfer', requireAuth, controller.transferUser);
router.post('/users/invites/:inviteId/resend', requireAuth, controller.resendInvite);
router.post('/users/invites/:inviteId/reject', requireAuth, controller.rejectInvite);

module.exports = router;
