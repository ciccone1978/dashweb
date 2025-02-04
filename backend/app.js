const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/views/index.html'));
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/views/auth/login.html'));
});

module.exports = app;