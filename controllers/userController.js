const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const buildUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  created_at: row.created_at
});

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows.map(buildUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(buildUser(rows[0]));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const validRoles = ['admin', 'doctor', 'patient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Check if user exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [email, password_hash, name, role]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: buildUser(rows[0])
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;
    
    // Check if user exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { rows } = await pool.query(
      'UPDATE users SET email = COALESCE($1, email), name = COALESCE($2, name), role = COALESCE($3, role) WHERE id = $4 RETURNING id, email, name, role, created_at',
      [email, name, role, id]
    );
    
    res.json({
      message: 'User updated successfully',
      user: buildUser(rows[0])
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete/disable user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete - disable user instead of hard delete
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
    
    res.json({ message: 'User disabled successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};