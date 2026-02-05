const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Create doctor request
exports.createDoctorRequest = async (req, res) => {
  try {
    const { email, password, name, specialty, licenseNumber, phone } = req.body;
    
    if (!email || !password || !name || !specialty || !licenseNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create doctor request
    const { rows } = await pool.query(
      'INSERT INTO doctor_requests (email, password_hash, name, specialty, license_number, phone, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [email, password_hash, name, specialty, licenseNumber, phone, 'pending']
    );
    
    res.status(201).json({
      message: 'Doctor request submitted successfully. Awaiting admin approval.',
      requestId: rows[0].id
    });
  } catch (error) {
    console.error('Error creating doctor request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all doctor requests (Admin only)
exports.getAllDoctorRequests = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, specialty, license_number, phone, status, created_at FROM doctor_requests ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching doctor requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve doctor request
exports.approveDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get request details
    const { rows: requestRows } = await pool.query(
      'SELECT * FROM doctor_requests WHERE id = $1 AND status = $2',
      [id, 'pending']
    );
    
    if (!requestRows.length) {
      return res.status(404).json({ error: 'Pending request not found' });
    }
    
    const request = requestRows[0];
    
    // Create user account
    const { rows: userRows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [request.email, request.password_hash, request.name, 'doctor', true]
    );
    
    // Create doctor profile
    await pool.query(
      'INSERT INTO doctors (user_id, specialty, license_number, phone) VALUES ($1, $2, $3, $4)',
      [userRows[0].id, request.specialty, request.license_number, request.phone]
    );
    
    // Update request status
    await pool.query(
      'UPDATE doctor_requests SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3',
      ['approved', req.user.id, id]
    );
    
    res.json({ message: 'Doctor request approved successfully' });
  } catch (error) {
    console.error('Error approving doctor request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject doctor request
exports.rejectDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if request exists and is pending
    const { rows: existing } = await pool.query(
      'SELECT id FROM doctor_requests WHERE id = $1 AND status = $2',
      [id, 'pending']
    );
    
    if (!existing.length) {
      return res.status(404).json({ error: 'Pending request not found' });
    }
    
    // Update request status
    await pool.query(
      'UPDATE doctor_requests SET status = $1, rejected_by = $2, rejected_at = NOW(), rejection_reason = $3 WHERE id = $4',
      ['rejected', req.user.id, reason, id]
    );
    
    res.json({ message: 'Doctor request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting doctor request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};