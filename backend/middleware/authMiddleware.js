// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
     if (!token) {
        // If there's no token, they might be trying to access a public page
        // You might want to have a list of public routes and only redirect if
        // the requested route is NOT public.
        logger.error('Unauthorized access');
        //return res.status(401).json({ message: 'Unauthorized' }); // Or redirect: res.redirect('/login');
        return res.redirect('/auth/login');
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                logger.error('Unauthorized:', err);
                return res.status(401).json({ message: 'Unauthorized' });
            } else {
                logger.error('Forbidden: Invalid token');
                return res.status(403).json({ message: 'Forbidden: Invalid token' });
            }
        }

        req.user = user;

        // Add cache-control headers AFTER successful authentication
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        next();
    });
}

module.exports = { authenticateToken };