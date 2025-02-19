// utils/helpers.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

// Generates a cryptographically secure random password using crypto module.
function generateSecureRandomPassword(length = 12) {
    if (length <= 0) {
        throw new Error("Password length must be greater than 0.");
    }
    const byteLength = Math.ceil(length * 0.75); //  ~3/4 of length for base64
    const buffer = crypto.randomBytes(byteLength); // Generate secure random bytes
    return buffer.toString('base64') // Encode as base64
        .replace(/\+/g, '-') // Replace URL-unsafe characters
        .replace(/\//g, '_')
        .replace(/=+$/, '') // Remove padding
        .substring(0, length); // Truncate to desired length
}

// Validates an email address using the validator.js library
function isValidEmail(email) {
    if (!email) {
        return false;
    }
    return validator.isEmail(email);
}


module.exports = { generateSecureRandomPassword, isValidEmail };