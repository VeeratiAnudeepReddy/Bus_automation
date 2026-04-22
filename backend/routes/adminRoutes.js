const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const routeController = require('../controllers/routeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin, requireFareManagerOrAdmin } = require('../middleware/adminMiddleware');

router.get('/admin/analytics', requireAuth, requireAdmin, adminController.getAnalytics);
router.get('/admin/routes', requireAuth, requireFareManagerOrAdmin, routeController.getAdminRoutes);
router.post('/admin/routes/create', requireAuth, requireFareManagerOrAdmin, routeController.createRoute);
router.put('/admin/routes/:id', requireAuth, requireFareManagerOrAdmin, routeController.updateRoute);
router.delete('/admin/routes/:id', requireAuth, requireFareManagerOrAdmin, routeController.deleteRoute);
router.patch('/admin/routes/:id/toggle', requireAuth, requireFareManagerOrAdmin, routeController.toggleRoute);
router.get('/admin/routes/fare-history', requireAuth, requireFareManagerOrAdmin, routeController.getFareHistory);

module.exports = router;
