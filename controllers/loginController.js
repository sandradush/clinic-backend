// controllers/loginController.js
const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// Rate limiter for signup/signin
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to build user response
const buildUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role
});

exports.signUp = [authLimiter, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check existing
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) return res.status(400).json({ error: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, password_hash, name || null, role || 'user']
    );

    const user = buildUser(rows[0]);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Server error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

exports.signIn = [authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await pool.query('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: userRow.id, email: userRow.email, name: userRow.name, role: userRow.role }, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ message: 'Sign in successful', user: buildUser(userRow), token });
  } catch (error) {
    console.error('Server error during signin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

exports.signOut = async (req, res) => {
  // With stateless JWTs, sign-out is client-side (remove token). Here we return success.
  res.status(200).json({ message: 'Sign out successful. Please delete token client-side.' });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Not authenticated' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Not authenticated' });
    const token = parts[1];

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh user from DB
    const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Not authenticated' });

    res.status(200).json({ user: buildUser(rows[0]) });
  } catch (error) {
    console.error('Server error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Return all users (id, email, name, role, created_at)
exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};