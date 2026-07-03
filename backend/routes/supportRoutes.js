const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/support/tickets', requireAuth, supportController.listTickets);
router.post('/support/tickets', requireAuth, supportController.createTicket);
router.get('/support/tickets/:id', requireAuth, supportController.getTicket);
router.patch('/support/tickets/:id', requireAuth, supportController.updateTicket);
router.delete('/support/tickets/:id', requireAuth, supportController.deleteTicket);
router.post('/support/tickets/:id/replies', requireAuth, supportController.reply);

module.exports = router;
