const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'frontend/public' directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve static files from the 'frontend/src' directory
app.use(express.static(path.join(__dirname, '../frontend/src')));

// --- Request Logging Middleware (BEFORE your routes) ---
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'No Request ID'; // Get the ID from the header
  const ip = req.ip; // Get the client's IP address
  // Log the request with IP address and request ID
  logger.info(`[${requestId}] ${req.method} ${req.url} - IP: ${ip}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/menu', menuRoutes);

app.get('/', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/views/index.html'));
});

// Protected API endpoint (example - you can have others)
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ username: req.user.username }); // Send user data as JSON
});

// --- 404 Error Handler (AFTER all other routes) ---
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/src/views/errors/404.html'));
});

// --- 500 Error Handler (AFTER 404 handler) ---
app.use((err, req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  const ip = req.ip;
  logger.error(`[${requestId}] ${err.message} - IP: ${ip}`, err); // Log the error (with stack trace)
  res.status(500).sendFile(path.join(__dirname, '../frontend/src/views/errors/500.html'));
});

module.exports = app;