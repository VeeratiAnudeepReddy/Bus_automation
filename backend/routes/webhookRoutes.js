const express = require('express');
const router = express.Router();
const clerkWebhookController = require('../controllers/clerkWebhookController');

router.post('/webhooks/clerk', clerkWebhookController.handleClerkWebhook);

module.exports = router;
