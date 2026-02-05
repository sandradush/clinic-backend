const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_change_this';

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many attempts, please try again later' }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many password reset attempts' }
});

const buildUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role
});

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Patient self-registration
exports.register = [authLimiter, async (req, res) => {
  try {
    const { email, password, name, phone, dateOfBirth, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) return res.status(400).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user with patient role
    const { rows: userRows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, password_hash, name, 'patient']
    );

    // Create patient profile
    await pool.query(
      'INSERT INTO patients (user_id, phone, date_of_birth, address) VALUES ($1, $2, $3, $4)',
      [userRows[0].id, phone, dateOfBirth, address]
    );

    const user = buildUser(userRows[0]);
    const tokens = generateTokens(user);
    
    res.status(201).json({ 
      message: 'Patient registered successfully', 
      user, 
      ...tokens 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

// Login
exports.login = [authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await pool.query('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user = buildUser(userRow);
    const tokens = generateTokens(user);

    res.status(200).json({ 
      message: 'Login successful', 
      user, 
      ...tokens 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [payload.id]);
    
    if (!rows[0]) return res.status(401).json({ error: 'Invalid refresh token' });

    const user = buildUser(rows[0]);
    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

// Forgot password
exports.forgotPassword = [passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!rows[0]) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset instructions have been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3',
      [resetToken, resetExpires, email]
    );

    // In production, send email with resetToken
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'If email exists, reset instructions have been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { rows } = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );

    if (!rows[0]) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [password_hash, rows[0].id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};