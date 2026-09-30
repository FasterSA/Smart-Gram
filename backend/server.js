const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bloodbankRoutes = require('./routes/bloodbank');
const marketRoutes = require('./routes/market');
const appConfigRoutes = require('./routes/appConfig');
const noticeRoutes = require('./routes/notices');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/uploads');
const sosRoutes = require('./routes/sos');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bloodbank', bloodbankRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/app-config', appConfigRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/sos', sosRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/smart-village';
const PRIMARY_MONGO_URI = process.env.MONGO_URI || LOCAL_MONGO_URI;
const FALLBACK_MONGO_URI = LOCAL_MONGO_URI;
const mongoUris = [PRIMARY_MONGO_URI, FALLBACK_MONGO_URI].filter(Boolean);

const startServer = async () => {
  let lastError = null;

  for (const uri of mongoUris) {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
      return;
    } catch (err) {
      lastError = err;
      console.warn(`MongoDB connection failed for ${uri}:`, err.message || err);
    }
  }

  console.error('Failed to connect to MongoDB using all configured URIs.', lastError);
  app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT} without a database connection. Some features will not work until MongoDB is reachable.`);
  });
};

startServer();
