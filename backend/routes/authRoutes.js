const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

//router.post('/login', authController.login);

router.get('/login', authController.login);
router.post('/login', authController.loginPost);

router.get('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.get('/forgot-password', authController.forgotPassword);
router.post('/forgot-password', authController.forgotPasswordPost);

router.get('/reset-password', authController.resetPassword);
router.post('/reset-password', authController.resetPasswordPost);

router.get('/change-password', authenticateToken, authController.changePassword);
router.post('/change-password', authenticateToken, authController.changePasswordPost);

router.get('/register', authController.register);
router.post('/register', authController.registerPost);

module.exports = router;