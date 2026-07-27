const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const requestContext = require('./middleware/requestContext');
const { securityHeaders, corsOptions, sanitizeRequest } = require('./middleware/securityMiddleware');
const rateLimiter = require('./middleware/rateLimiter');
const apiVersion = require('./middleware/apiVersion');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const systemController = require('./controllers/systemController');
const jobService = require('./services/jobService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const routeRoutes = require('./routes/routeRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const fleetOperationsRoutes = require('./routes/fleetOperationsRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const enterpriseWalletRoutes = require('./routes/enterpriseWalletRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const postRoutes = require('./routes/postRoutes');
const supportRoutes = require('./routes/supportRoutes');
const systemRoutes = require('./routes/systemRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Import middleware
const { orgContextMiddleware } = require('./middleware/permissions');

const app = express();

// Middleware
app.disable('x-powered-by');
app.use(requestContext);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({
  limit: config.REQUEST_BODY_LIMIT,
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(sanitizeRequest);
app.use(rateLimiter);
app.use(apiVersion);
app.use(orgContextMiddleware());
jobService.registerDefaultJobs();
if (config.FEATURE_FLAGS.jobs && config.NODE_ENV !== 'test') {
  const scheduled = jobService.startScheduledJobs();
  logger.scheduler('scheduled_jobs_boot', scheduled);
}

// Connect to MongoDB
mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.database('mongodb_connected', { database: mongoose.connection.name });
  })
  .catch((error) => {
    logger.error('mongodb_connection_failed', { error: error.message });
    if (config.NODE_ENV === 'production') {
      process.exitCode = 1;
    }
  });

function mountApi(prefix) {
  app.use(prefix, systemRoutes);
  app.use(prefix, authRoutes);
  app.use(prefix, walletRoutes);
  app.use(prefix, ticketRoutes);
  app.use(prefix, adminRoutes);
  app.use(prefix, routeRoutes);
  app.use(prefix, organizationRoutes);
  app.use(prefix, userManagementRoutes);
  app.use(prefix, fleetOperationsRoutes);
  app.use(prefix, pricingRoutes);
  app.use(prefix, bookingRoutes);
  app.use(prefix, enterpriseWalletRoutes);
  app.use(prefix, paymentRoutes);
  app.use(prefix, reportingRoutes);
  app.use(prefix, postRoutes);
  app.use(prefix, supportRoutes);
  app.use(prefix, webhookRoutes);
}

// Mount all routes under legacy and versioned API prefixes.
mountApi('/api');
mountApi('/api/v1');

app.get('/health', systemController.health);
app.get('/ready', systemController.ready);
app.get('/live', systemController.live);
app.get('/metrics', systemController.metrics);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'QR Bus Ticketing System API is running' });
});

app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(config.PORT, () => {
  logger.info('server_started', { port: config.PORT, environment: config.NODE_ENV });
});

module.exports = { app, server };
