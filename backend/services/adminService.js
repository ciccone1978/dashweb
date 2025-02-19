const db = require('../config/db');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers')
const bcrypt = require('bcrypt');

exports.getUsers = async () => {
    try {
        const query = 'SELECT id, first_name, last_name, username, email, status FROM login.users'; // Simple query
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        logger.error('Database error while fetching users', error);
        throw new Error('Failed to fetch users');
    }
    
};

exports.toggleUserStatus = async (id, status) => {
    try {
        const query = 'UPDATE login.users SET status = $1, updated_at = NOW() WHERE id = $2';
        await db.query(query, [status, id]);    
    } catch (error) {
        logger.error('Database error while updating user status', error);
        throw new Error('Failed to update user status');    
    }
}

exports.getUserInfo = async (id) => {
    try {
        const query = 'SELECT id, first_name, last_name, username, email, status FROM login.users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        logger.error('Database error while fetching user info', error);
        throw new Error('Failed to fetch user info');   
    }
}

exports.updateUser = async(id, updatedData) => {
    try {
        const query = `
            UPDATE login.users 
            SET username = $1, email = $2, first_name = $3, last_name = $4, updated_at = NOW()
            WHERE id = $5 RETURNING *;`;    
        
        const values = [updatedData.username, updatedData.email, updatedData.first_name, updatedData.last_name, id];    
        const { rows } = await db.query(query, values);
        return rows;
        
    } catch (error) {
        logger.error('Database error while updating user', error);
        throw new Error('Failed to update user');   
    }
}


exports.createUser = async(userData) => {
    try {
        const newPassword = helpers.generateSecureRandomPassword(12);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const query = `
            INSERT INTO login.users (username, email, first_name, last_name, password_hash) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id`;
        
        const values = [userData.username, userData.email, userData.first_name, userData.last_name, hashedPassword];

        const {rows} = await db.query(query, values);
        return { id: rows[0].id };
        
    } catch (error) {
        logger.error('Database error while creating user', error);
        throw new Error('Failed to create user');   
    }
}