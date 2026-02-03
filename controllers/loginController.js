const pool = require('../config/db');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Login successful',
      user,
      token: `token_${user.id}_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

const register = async (req, res) => {
  const { email, password, name, role = 'nurse' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, password, name, role]
    );

    const newUser = result.rows[0];
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  login,
  register
};