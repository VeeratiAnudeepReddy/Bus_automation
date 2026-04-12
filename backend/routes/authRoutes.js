const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/sync
router.post('/auth/sync', authController.syncClerkUser);

module.exports = router;
