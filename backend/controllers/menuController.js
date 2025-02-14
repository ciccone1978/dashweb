// controllers/menuController.js
const db = require('../config/db');
const logger = require('../utils/logger');

const getMenu = async (req, res) => {
    const userId = req.user.id; // Get user ID from the authenticated token
    const requestId = req.headers['x-request-id'] || 'No Request ID';

    try {
        // Call the PostgreSQL function
        const query = 'SELECT login.get_user_menu($1::integer)::text AS menu';
        const { rows } = await db.query(query, [userId]);

        if (rows.length === 0 || !rows[0].menu) {
            // Handle cases where the function returns no data or null
            logger.warn(`[${requestId}] No menu data found for user ID: ${userId}`);
            return res.status(200).json({ menu: [] }); // Return an empty menu
        }
        logger.info(`Menu successfully displayed`)

        const menu = typeof rows[0].menu === "string" ? JSON.parse(rows[0].menu) : rows[0].menu;
        res.status(200).json(menu); // Send the menu data


    } catch (error) {
        logger.error(`[${requestId}] Error fetching menu for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getMenu };