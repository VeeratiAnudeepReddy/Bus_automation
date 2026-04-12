const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/wallet/add
router.post('/wallet/add', requireAuth, walletController.addBalance);

module.exports = router;
