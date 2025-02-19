const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');

// Apply authentication and admin check middleware
router.use(authMiddleware.authenticateToken);
//router.use(authMiddleware.ensureAdmin);

// Serve the static HTML file
router.get("/users/manage", (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/views/admin/users.html'));
});

//Fetch all users (for DataTable)
router.get('/users', adminController.getUsers);
//Fetch a specific user by ID (for editing)
router.get('/users/:id', adminController.getUserInfo);
//Create a new user
router.post('/users', adminController.createUser);
//Update an existing user
router.put('/users/:id', adminController.updateUser);
//Enable or disable a user (soft disable)
router.patch('/users/:id/status', adminController.toggleUserStatus);

module.exports = router;
