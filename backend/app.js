const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Routes
app.use('/auth', authRoutes);

app.get('/', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/views/index.html'));
});

// Protected API endpoint (example - you can have others)
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ username: req.user.username }); // Send user data as JSON
});

module.exports = app;