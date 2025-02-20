const logger = require('../utils/logger');
const adminService = require('../services/adminService');

//Fetch all users (for DataTable)
exports.getUsers = async (req, res) => {
    try {
        const users = await adminService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

//Enable or disable a user (soft disable)
exports.toggleUserStatus = async (req, res) => {
    try {
        const {status} = req.body;
        await adminService.toggleUserStatus(req.params.id, status);
        res.status(200).json({ message: `User ${status ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }    
};

//Fetch a specific user by ID (for editing)
exports.getUserInfo = async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'No Request ID';
    try {
        const userInfo = await adminService.getUserInfo(req.params.id);
        res.status(200).json(userInfo);
    } catch (error) {
        logger.error(`[${requestId}] Error getting user info: ${error.message}`, error);
        res.status(500).json({ message: 'Error getting user info' });
    }
};

// Update an existing user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body; 
        const updatedUser = await adminService.updateUser(userId, updatedData);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

//Create a new user
exports.createUser = async (req, res) => {
    try {
        const newUser = await adminService.createUser(req.body);
        res.status(200).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};


// ---Requests approval---
exports.getRequests = async (req, res) => {
    try {
        const requests = await adminService.getRequests();
        res.status(200).json(requests);
    } catch (error) {
        logger.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const approved_by = req.user.id;
        await adminService.rejectRequest(req.params.id, approved_by);
        res.status(200).json({ message: `User request rejected successfully` });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: 'Error rejecting request' });
    }    
};

exports.approveRequest = async (req, res) => {
    try {
        const approved_by = req.user.id;
        const newUser = await adminService.approveRequest(req.params.id, approved_by);
        res.status(200).json({ message: `User request approved successfully`, newUser });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ message: 'Error approving request' });
    }    
};

//module.exports = { getUsers, toggleUserStatus, getUserInfo, updateUser };