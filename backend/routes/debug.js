const express = require('express');
const { clerkAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/debug', clerkAuth, (req, res) => {
  return res.status(200).json({ auth: req.auth || null });
});

module.exports = router;
