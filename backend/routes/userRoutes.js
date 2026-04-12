const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/user/:userId
router.get('/user/:userId', userController.getUserDetails);

// GET /api/user/:userId/tickets
router.get('/user/:userId/tickets', userController.getUserTickets);

// GET /api/users
router.get('/users', userController.getAllUsers);

module.exports = router;
