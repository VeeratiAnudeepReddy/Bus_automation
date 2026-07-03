const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/permissions');

router.post('/payments/create-order', requireAuth, paymentController.createOrder);
router.post('/payments/verify', requireAuth, paymentController.verify);
router.post('/payments/webhook', paymentController.webhook);
router.get('/payments', requireAuth, paymentController.listPayments);
router.get('/payments/history', requireAuth, paymentController.listPayments);
router.get('/payments/:id', requireAuth, paymentController.getPayment);
router.post('/payments/:id/refund', requireAuth, requireRole('finance_manager', 'org_owner', 'org_admin', 'super_admin'), paymentController.refund);

module.exports = router;
