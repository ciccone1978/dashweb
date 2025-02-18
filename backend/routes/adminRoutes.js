const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication and admin check middleware
router.use(authMiddleware.authenticateToken);
//router.use(authMiddleware.ensureAdmin);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.getUsersPost);
//router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);

module.exports = router;
