const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/bookings/seats', requireAuth, bookingController.seatAvailability);
router.post('/bookings', requireAuth, bookingController.createBooking);
router.get('/bookings', requireAuth, bookingController.listBookings);
router.get('/bookings/:id/recover', requireAuth, bookingController.recoverBooking);
router.get('/bookings/:id/invoice', requireAuth, bookingController.getInvoice);
router.get('/bookings/:id/receipt', requireAuth, bookingController.getReceipt);
router.get('/bookings/:id', requireAuth, bookingController.getBooking);
router.post('/bookings/:id/cancel', requireAuth, bookingController.cancelBooking);
router.get('/refunds', requireAuth, bookingController.listRefunds);

module.exports = router;
