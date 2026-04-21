const express = require('express');
const walletController = require('../controllers/walletController');
const { clerkAuth, requireClerkAuth, attachUser } = require('../middleware/auth');

const router = express.Router();

router.post('/wallet/add', clerkAuth, requireClerkAuth, attachUser, walletController.addBalance);

module.exports = router;
