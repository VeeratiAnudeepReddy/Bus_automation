const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// User endpoints
router.post('/tickets/book', requireAuth, ticketController.bookTickets);
router.get('/tickets/my', requireAuth, ticketController.getMyTickets);

// Admin endpoint
router.post('/tickets/scan', requireAuth, requireAdmin, ticketController.scanTicket);

module.exports = router;
