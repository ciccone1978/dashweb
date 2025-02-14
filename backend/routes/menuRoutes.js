// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, menuController.getMenu);

module.exports = router;