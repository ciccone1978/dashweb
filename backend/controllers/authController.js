const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from the database
    const userQuery = 'SELECT * FROM login.users WHERE username = $1';
    const { rows } = await db.query(userQuery, [username]);
    console.log(rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login };