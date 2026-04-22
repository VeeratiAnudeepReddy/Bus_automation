const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const routeRoutes = require('./routes/routeRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Mount all routes under /api
app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', ticketRoutes);
app.use('/api', adminRoutes);
app.use('/api', routeRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'QR Bus Ticketing System API is running' });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
});
