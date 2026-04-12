const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/admin/analytics', requireAuth, requireAdmin, adminController.getAnalytics);

module.exports = router;
