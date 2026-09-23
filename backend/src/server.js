// =====================================================
// ENVIRONMENT + DNS
// =====================================================

const path = require('path');
const dns = require('dns');

// Load the ROOT .env file
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

// MongoDB Atlas DNS fix
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
]);

dns.setDefaultResultOrder('ipv4first');

// =====================================================
// IMPORTS
// =====================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const connectDB = require('./config/db');
const routes = require('./routes');

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Uploads directory ready');
}

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '500mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '500mb',
  })
);

// =====================================================
// UPLOAD TIMEOUT
// =====================================================

app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use('/uploads', express.static(uploadsDir));

// =====================================================
// API ROUTES
// =====================================================

app.use('/api', routes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Fort Media API is running',
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum 500MB.',
      });
    }

    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('======================================');
  console.log('        FORT MEDIA API');
  console.log('======================================');
  console.log(`✓ Server : http://localhost:${PORT}`);
  console.log(`✓ API    : http://localhost:${PORT}/api`);
  console.log(`✓ Health : http://localhost:${PORT}/api/health`);
  console.log('======================================');
  console.log('');
});

// =====================================================
// SERVER TIMEOUTS
// =====================================================

server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 610000;