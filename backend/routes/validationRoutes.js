const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');

// POST /api/validate
router.post('/validate', validationController.validateTicket);
router.post('/tickets/validate', validationController.validateTicket);
router.get('/validation-history', validationController.getValidationHistory);

module.exports = router;
