const express = require('express');
const ticketController = require('../controllers/ticketController');
const { clerkAuth, requireClerkAuth, attachUser, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/tickets/book', clerkAuth, requireClerkAuth, attachUser, ticketController.bookTickets);
router.get('/tickets/my', clerkAuth, requireClerkAuth, attachUser, ticketController.getMyTickets);
router.post('/tickets/scan', clerkAuth, requireClerkAuth, attachUser, requireAdmin, ticketController.scanTicket);

module.exports = router;
