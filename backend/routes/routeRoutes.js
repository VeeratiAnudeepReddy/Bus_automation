const express = require('express');
const routeController = require('../controllers/routeController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/routes', requireAuth, routeController.getRoutesForUser);

module.exports = router;
