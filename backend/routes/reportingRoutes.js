const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/permissions');

const canViewReports = requireRole('finance_manager', 'org_owner', 'org_admin', 'super_admin', 'operations_manager', 'fleet_manager', 'dispatcher', 'driver', 'conductor', 'support');

router.get('/finance/dashboard', requireAuth, canViewReports, reportingController.financeDashboard);
router.get('/audit', requireAuth, canViewReports, reportingController.auditLogs);
router.get('/reports', requireAuth, canViewReports, reportingController.reports);
router.get('/reports/:module', requireAuth, canViewReports, reportingController.moduleReport);
router.get('/search', requireAuth, reportingController.globalSearch);
router.get('/notifications', requireAuth, notificationController.listNotifications);
router.post('/notifications', requireAuth, canViewReports, notificationController.createNotification);
router.get('/notifications/preferences', requireAuth, notificationController.preferences);
router.patch('/notifications/preferences', requireAuth, notificationController.updatePreferences);
router.patch('/notifications/read', requireAuth, notificationController.markRead);
router.patch('/notifications/read-all', requireAuth, notificationController.markAllRead);
router.delete('/notifications/:id', requireAuth, notificationController.deleteNotification);

module.exports = router;
