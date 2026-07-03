const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/permissions');

const canManagePricing = requireRole('price_manager', 'org_owner', 'org_admin', 'super_admin');

router.get('/pricing', requireAuth, canManagePricing, pricingController.listPricing);
router.post('/pricing', requireAuth, canManagePricing, pricingController.createPricing);
router.patch('/pricing/:id', requireAuth, canManagePricing, pricingController.updatePricing);
router.post('/pricing/:id/publish', requireAuth, canManagePricing, pricingController.publishPricing);
router.get('/pricing/history', requireAuth, canManagePricing, pricingController.history);
router.post('/pricing/simulate', requireAuth, canManagePricing, pricingController.simulate);

router.get('/coupons', requireAuth, canManagePricing, pricingController.listCoupons);
router.post('/coupons', requireAuth, canManagePricing, pricingController.createCoupon);
router.post('/coupons/validate', requireAuth, pricingController.validateCoupon);
router.get('/coupons/:id', requireAuth, canManagePricing, pricingController.getCoupon);

module.exports = router;
