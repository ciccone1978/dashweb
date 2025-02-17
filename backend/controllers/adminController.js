const db = require('../config/db');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const path = require('path');

const getUsers = (req, res) => {
  // Serve the static HTML file
  res.sendFile(path.join(__dirname, '../../frontend/src/views/admin/users.html'));
};

const getUsersPost = async (req, res) => {
    try {
        const query = 'SELECT id, first_name, last_name, username, email, status FROM login.users'; // Simple query
        const { rows } = await db.query(query);
        res.status(200).json(rows); // Return the data as JSON
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getUsers, getUsersPost };