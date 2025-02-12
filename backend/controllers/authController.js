const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('../config/db');
const logger = require('../utils/logger');

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
        maxAge: 900000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000, //7 days
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

module.exports = { login, loginPost, logout, refreshToken };