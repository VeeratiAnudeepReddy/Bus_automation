const express = require('express');
const router = express.Router();
const walletController = require('../controllers/enterpriseWalletController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/wallet/recharge', requireAuth, walletController.recharge);
router.get('/wallet/transactions', requireAuth, walletController.transactions);
router.get('/wallet/ledger', requireAuth, walletController.ledger);

module.exports = router;
