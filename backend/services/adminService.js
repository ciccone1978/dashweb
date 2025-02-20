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


// ---Requests approval---
exports.getRequests = async () => {
    try {
        const query = `SELECT id, first_name, last_name, username, email, status 
            FROM login.registration_requests
            where status = 'pending'`;

        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        logger.error('Database error while fetching requests', error);
        throw new Error('Failed to fetch requests');
    } 
};

exports.rejectRequest = async (id, approved_by) => {
    try {
        const query = `UPDATE login.registration_requests
            SET status='rejected'::text, approved_by=$1, approval_date=now()
            WHERE id = $2;`;

        await db.query(query, [approved_by, id]);

    } catch (error) {
        logger.error('Database error while rejecting request', error);
        throw new Error('Failed to reject request');
    } 
};

exports.approveRequest = async (id, approved_by) => {
    try {
        await db.query('BEGIN');

        const requestQuery =
            `SELECT * FROM login.registration_requests WHERE id = $1 AND status = 'pending'`;
    
        const requestResult = await db.query(requestQuery, [id]);
        if (requestResult.rows.length === 0) {
            await db.query('ROLLBACK'); // Rollback transaction
            return { message: 'Request not found or already processed' };
        }
        const request = requestResult.rows[0];

        const updateQuery = `UPDATE login.registration_requests
            SET status='approved'::text, approved_by=$1, approval_date=now()
            WHERE id = $2;`;

        await db.query(updateQuery, [approved_by, id]);

        const newPassword = helpers.generateSecureRandomPassword(12);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

         const createUserQuery = `INSERT INTO login.users
            (username, email, password_hash, first_name, last_name)
            VALUES($1, $2, $3, $4, $5) RETURNING id;`

        const values = [request.username, request.email, hashedPassword, request.first_name, request.last_name];
        const {rows} = await db.query(createUserQuery, values);

        await db.query('COMMIT');

        return { id: rows[0].id };    

    } catch (error) {
        await db.query('ROLLBACK');
        logger.error('Database error while rejecting request', error);
        throw new Error('Failed to reject request');
    } 
};