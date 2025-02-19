const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const db = require('../config/db');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');
const ms = require('ms');

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
  });
}

//login GET
const login = (req, res) => {
  // Serve the static HTML file
  res.sendFile(path.join(__dirname, '../../frontend/src/views/auth/login.html'));
};

//login POST
const loginPost = async (req, res) => {
  const { username, password } = req.body;
  const requestId = req.headers['x-request-id'] || 'No Request ID'; //for correlation
  const ip = req.ip; // Get IP

  try {
    // Fetch user from the database
    const userQuery = 'SELECT * FROM login.users WHERE username = $1';
    const { rows } = await db.query(userQuery, [username]);

    if (rows.length === 0) {
      logger.warn(`[${requestId}] Login attempt failed: Invalid username ${username} - IP: ${ip}`); // Log with username and IP
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`[${requestId}] Login attempt failed: Invalid password for user ${username} - IP: ${ip}`); // Log with username and IP
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store the JWT in an HTTP-only cookie 
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(process.env.JWT_ACCESS_TOKEN_EXPIRATION)
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(process.env.JWT_REFRESH_TOKEN_EXPIRATION)
    });

    /* const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    }); */

    logger.info(`[${requestId}] Login successful for user ${username} - IP: ${ip}`);
    res.status(200).json({ message: 'Login successful' });
    //return res.json({ message: "Login successful", token:token, username:username });
    
  } catch (error) {
    logger.error(`[${requestId}] Error during login: ${error.message} - IP: ${ip}`, error); // Log with IP
    res.status(500).json({ message: 'Internal server error' });
  }
};


//refresh-token POST
const refreshToken = async (req, res) => {
  const requestId = req.headers['x-request-id'] || 'No Request ID'; // Get request ID
  const refreshToken = req.cookies.refreshToken;
  const ip = req.ip

  if (!refreshToken) {
      logger.warn(`[${requestId}] No refresh token provided - IP: ${ip}`);
      return res.status(401).json({message: 'Unauthorized'});
  }

  try {
    const user = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const accessToken = generateAccessToken(user);

     res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 900000,
      });

      logger.info(`[${requestId}] Token refreshed successfully for user ${user.username} - IP: ${ip}`);
      res.status(200).json({ message: "Token refreshed" });


  } catch (err) {
      if (err.name === 'TokenExpiredError') {
          logger.warn(`[${requestId}] Refresh token expired - IP: ${ip}`);
          return res.status(401).json({message: 'Unauthorized'});

      } else {
          logger.error(`[${requestId}] Error during refresh token: ${err.message} - IP: ${ip}`, err);
          return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
  }
};

//logout GET
const logout = (req, res) => {
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  const refreshToken = req.cookies.refreshToken;
  const user = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const ip = req.ip;
  //const username = req.user ? req.user.username : 'Unknown User';
  
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  logger.info(`[${requestId}] Logout successful for user ${user.username} - IP: ${ip}`);
  res.status(200).json({ message: 'Logout successful' });
};


// --- Forgot Password ---
const forgotPassword = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/views/auth/forgot-password.html'));
};

const forgotPasswordPost = async (req, res) => {
  const { email } = req.body;
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  const ip = req.ip

  try {
      // 1. Validate email
      if (!email) {
          return res.status(400).json({ message: 'Email is required' });
      }

      // 2. Find user by email
      const userQuery = 'SELECT * FROM login.users WHERE email = $1';
      const { rows } = await db.query(userQuery, [email]);

      if (rows.length === 0) {
          // Don't reveal whether the email exists or not.  Just send a generic success message.
          logger.warn(`[${requestId}] Password reset requested for non-existent email: ${email} - IP: ${ip}`);
          return res.status(200).json({ message: 'A password reset link has been sent.' });
      }

      const user = rows[0];

      // 3. Generate a unique reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // 4. Store the token and expiration time in the database
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const updateQuery = `
          UPDATE login.users
          SET reset_token = $1, reset_token_expires_at = $2
          WHERE id = $3`;
      await db.query(updateQuery, [resetToken, expiresAt, user.id]);

      // 5. Send password reset email
      await sendPasswordResetEmail(email, resetToken);

      logger.info(`[${requestId}] Password reset requested for user: ${user.username} - IP: ${ip}`);
      res.status(200).json({ message: 'A password reset link has been sent.' });

  } catch (error) {
      logger.error(`[${requestId}]Error during password reset request - IP: ${ip}`, error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Email Password Reset Function (using Nodemailer) ---
async function sendPasswordResetEmail(email, resetToken) {
  try {
    //Ethreal only
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    // Construct the reset link
    const resetLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.MANAGER_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `
              You have requested to reset your password. Please click the following link to reset it:
              
              ${resetLink}   
              
              This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
          `,
      html: `
              <p>You have requested to reset your password. Please click the following link to reset it:</p>
              <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
              <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          `,
    };
    

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent: ${info.messageId}`);
      
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

 } catch (error) {
     logger.error(`Error sending password reset email: ${error}`);
     throw error; // Re-throw
 }
}


// --- Reset Password ---

const resetPassword = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/views/auth/reset-password.html'));
};

const resetPasswordPost = async (req, res) => {
  const { token, newPassword } = req.body;
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  const ip = req.ip;

  try {
      // 1. Validate input
      if (!token || !newPassword) {
          return res.status(400).json({ message: 'Token and new password are required' });
      }

      // 2. Find user by reset token and check expiration
      const userQuery = `
          SELECT * FROM login.users
          WHERE reset_token = $1 AND reset_token_expires_at > NOW()`;
      const { rows } = await db.query(userQuery, [token]);

      if (rows.length === 0) {
           logger.warn(`[${requestId}] Invalid or expired password reset token used - IP: ${ip}`);
          return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const user = rows[0];

      // 3. Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 4. Update the user's password and clear the reset token
      const updateQuery = `
          UPDATE login.users
          SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL
          WHERE id = $2`;
      await db.query(updateQuery, [hashedPassword, user.id]);

      logger.info(`[${requestId}] Password reset successful for user: ${user.username} - IP: ${ip}`);
      res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
      logger.error(`[${requestId}] Error during password reset - IP: ${ip}`, error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Change Password ---
//
const changePassword = (req,res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/views/auth/change-password.html'));
}

const changePasswordPost = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Get user ID from req.user (set by authenticateToken)
  const requestId = req.headers['x-request-id'] || 'No Request ID';
  const ip = req.ip;

  try {
      // --- 1. Validate input ---
      if (!currentPassword || !newPassword) {
        logger.warn(`[${requestId}] Change password attempt failed: Missing required fields - IP: ${ip}`);
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      //validate new password
      if(newPassword.length < 8){ // Example: check min length
        logger.warn(`[${requestId}] Change password attempt failed: the password is not valid - IP: ${ip}`);
        return res.status(400).json({message: 'The password is not valid'})
      }

      // --- 2. Get the user's current (hashed) password ---
      const userQuery = 'SELECT password_hash, username FROM login.users WHERE id = $1'; // Get hashed password
      const { rows } = await db.query(userQuery, [userId]);

      if (rows.length === 0) {
          // This should never happen if authenticateToken is working correctly,
          // but it's good to have a check.
           logger.error(`[${requestId}]Change password attempt failed: User not found - IP: ${ip}`);
          return res.status(404).json({ message: 'User not found' });
      }

      const user = rows[0];

      // --- 3. Verify the current password ---
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        logger.warn(`[${requestId}]Change password attempt failed: Invalid current password for user ${user.username} - IP: ${ip}`);
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // --- 4. Hash the new password ---
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // --- 5. Update the user's password in the database ---
      const updateQuery = 'UPDATE login.users SET password_hash = $1 WHERE id = $2';
      await db.query(updateQuery, [newPasswordHash, userId]);

      // --- 6. (Optional) Clear Session / Invalidate Tokens ---
      //     This is a good security practice.  You'd need to adapt this
      //     based on how you're storing/managing tokens.  For example,
      //     if you're using a blacklist for revoked tokens, you'd add
      //     the current access token to the blacklist. If you are using
      //     refresh tokens stored in db, you would delete them.

      logger.info(`[${requestId}] Password changed successfully for user: ${user.username} - IP: ${ip}`);
      res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
      logger.error(`[${requestId}] Error during password change for user ID: ${userId} - IP: ${ip}`);
      res.status(500).json({ message: 'Internal server error' });
  }

};



module.exports = { login, loginPost, logout, refreshToken, 
  forgotPassword, forgotPasswordPost,
  resetPassword, resetPasswordPost,
  changePassword, changePasswordPost
 };