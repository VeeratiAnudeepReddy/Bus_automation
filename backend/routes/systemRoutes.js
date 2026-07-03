const express = require('express');
const controller = require('../controllers/systemController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/permissions');

const router = express.Router();

router.get('/meta', controller.apiMetadata);
router.get('/runtime-config', requireAuth, requireSuperAdmin(), controller.runtimeConfig);
router.get('/jobs', requireAuth, requireSuperAdmin(), controller.jobs);
router.post('/jobs/:name/run', requireAuth, requireSuperAdmin(), controller.runJob);
router.post('/backups', requireAuth, requireSuperAdmin(), controller.createBackup);

module.exports = router;
