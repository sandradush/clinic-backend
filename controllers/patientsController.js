const pool = require('../config/db');

// Get all patients (Admin/Doctor access)
exports.getAllPatients = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, u.name, u.email, p.phone, p.date_of_birth, p.address, p.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE u.is_active = true
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get patient by ID (Admin/Doctor access)
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT p.id, u.name, u.email, p.phone, p.date_of_birth, p.address, p.created_at
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND u.is_active = true
    `, [id]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get own profile (Patient access)
exports.getMyProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, u.name, u.email, p.phone, p.date_of_birth, p.address
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = $1
    `, [req.user.id]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create patient (Admin access)
exports.createPatient = async (req, res) => {
  try {
    const { email, password, name, phone, dateOfBirth, address } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Check if user exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const { rows: userRows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, password_hash, name, 'patient']
    );
    
    // Create patient profile
    const { rows: patientRows } = await pool.query(
      'INSERT INTO patients (user_id, phone, date_of_birth, address) VALUES ($1, $2, $3, $4) RETURNING id',
      [userRows[0].id, phone, dateOfBirth, address]
    );
    
    res.status(201).json({
      message: 'Patient created successfully',
      patientId: patientRows[0].id
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update patient (Admin access)
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, dateOfBirth, address } = req.body;
    
    // Check if patient exists
    const { rows: existing } = await pool.query('SELECT user_id FROM patients WHERE id = $1', [id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Update patient
    await pool.query(
      'UPDATE patients SET phone = COALESCE($1, phone), date_of_birth = COALESCE($2, date_of_birth), address = COALESCE($3, address) WHERE id = $4',
      [phone, dateOfBirth, address, id]
    );
    
    // Update user name if provided
    if (name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, existing[0].user_id]);
    }
    
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update own profile (Patient access)
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, address } = req.body;
    
    // Update patient
    await pool.query(
      'UPDATE patients SET phone = COALESCE($1, phone), date_of_birth = COALESCE($2, date_of_birth), address = COALESCE($3, address) WHERE user_id = $4',
      [phone, dateOfBirth, address, req.user.id]
    );
    
    // Update user name if provided
    if (name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Archive patient (Admin access)
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const { rows: existing } = await pool.query('SELECT user_id FROM patients WHERE id = $1', [id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Soft delete - disable user
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [existing[0].user_id]);
    
    res.json({ message: 'Patient archived successfully' });
  } catch (error) {
    console.error('Error archiving patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};