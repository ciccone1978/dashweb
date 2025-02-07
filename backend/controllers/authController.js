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

  try {
    // Fetch user from the database
    const userQuery = 'SELECT * FROM login.users WHERE username = $1';
    const { rows } = await db.query(userQuery, [username]);

    if (rows.length === 0) {
      logger.error(`Login attempt failed: Invalid username ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.error(`Login attempt failed: Invalid password for user ${username}`);
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

    logger.info(`Login successful for user ${username}`);
    res.status(200).json({ message: 'Login successful' });
    //return res.json({ message: "Login successful", token:token, username:username });
    
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//refresh-token POST
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    logger.error('Unauthorized');
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

    logger.info('Token refreshed');
    res.status(200).json({ message: "Token refreshed" });

  } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.error('Unauthorized:', err);
        return res.status(401).json({message: 'Unauthorized'});

      } else {
        logger.error('Error during refresh token:', err)
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
  }
};

//logout GET
const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  logger.info('Logout successful')
  res.status(200).json({ message: 'Logout successful' });
};

module.exports = { login, loginPost, logout, refreshToken };