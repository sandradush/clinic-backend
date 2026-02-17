const rateLimit = require('express-rate-limit');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_change_this';

// Rate limiter for password reset only
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many password reset attempts' }
});

const buildUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  status: row.status
});

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Patient self-registration
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

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
      'INSERT INTO users (email, password_hash, name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, status',
      [email, password_hash, name, 'user', 'pending']
    );

    // Note: patient profile table not used for auth; user created in `users` table only
    const user = buildUser(userRows[0]);
 
    res.status(201).json({
      message: 'User registered successfully',
      user,
     
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await pool.query('SELECT id, email, password_hash, name, role, status FROM users WHERE email = $1', [email]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user = buildUser(userRow);

    // Admins bypass doctor profile/status checks
    if (user.role === 'admin') {
      return res.status(200).json({ message: 'Login successful', user });
    }

    // If doctor role, attach doctor's profile status (or 'not exist')
    if (user.role === 'doctor') {
      try {
        const { rows: doctorRows } = await pool.query('SELECT id, user_id, status FROM doctors WHERE user_id = $1', [user.id]);
        const doctor = doctorRows[0];
        if (!doctor) {
          // Doctor profile missing — include status and indicate profile needed
          user.doctorStatus = 'not exist';
          return res.status(200).json({ message: 'Login successful', user, needsDoctorProfile: true });
        }
        user.doctorStatus = doctor.status || 'pending';
        if (doctor.status && doctor.status.toLowerCase() !== 'approved') {
          return res.status(403).json({ message: 'Waiting for clinic approval', user, doctorStatus: doctor.status });
        }
      } catch (err) {
        console.error('Doctor lookup error:', err);
        // fallthrough to successful login if doctors table/query not available
      }
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get list of users with role 'doctor' (id and name)
exports.getDoctors = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM users WHERE role = $1', ['doctor']);
    res.json(rows);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get doctors by status (helper)
const getDoctorsByStatus = async (status) => {
  const q = `
    SELECT d.id as doctor_id, u.id as user_id, u.name, u.email, d.phone, d.speciality,
           d.licence_file_path, d.national_id, d.status, d.created_at, d.updated_at
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE d.status = $1
    ORDER BY d.created_at DESC
  `;
  const { rows } = await pool.query(q, [status]);
  return rows;
};

// Get pending doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const rows = await getDoctorsByStatus('pending');
    res.json(rows);
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get approved doctors
exports.getApprovedDoctors = async (req, res) => {
  try {
    const rows = await getDoctorsByStatus('approved');
    res.json(rows);
  } catch (error) {
    console.error('Get approved doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dashboard summary: total doctors and total patients (from users table)
exports.getDashboardSummary = async (req, res) => {
  try {
    const q = `
      SELECT role, COUNT(*) AS count
      FROM users
      WHERE role IN ('doctor', 'patient')
      GROUP BY role
    `;
    const { rows } = await pool.query(q);

    const summary = { totalDoctors: 0, totalPatients: 0 };
    rows.forEach(r => {
      if (r.role === 'doctor') summary.totalDoctors = parseInt(r.count, 10);
      if (r.role === 'patient') summary.totalPatients = parseInt(r.count, 10);
    });

    // Count pending appointments
    try {
      const { rows: apptRows } = await pool.query(
        `SELECT COUNT(*)::int AS pending_count FROM appointments WHERE COALESCE(status, 'pending') = 'pending'`
      );
      summary.pendingAppointments = apptRows[0] ? apptRows[0].pending_count : 0;
    } catch (err) {
      console.error('Failed to get pending appointments count:', err);
      summary.pendingAppointments = 0;
    }

    // Count approved appointments
    try {
      const { rows: approvedRows } = await pool.query(
        `SELECT COUNT(*)::int AS approved_count FROM appointments WHERE status = 'approved'`
      );
      summary.approvedAppointments = approvedRows[0] ? approvedRows[0].approved_count : 0;
    } catch (err) {
      console.error('Failed to get approved appointments count:', err);
      summary.approvedAppointments = 0;
    }

    res.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get list of users with role 'patient' (id and name)
exports.getPatients = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM users WHERE role = $1', ['patient']);
    res.json(rows);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

// Create doctor profile tied to a user
exports.createDoctor = async (req, res) => {
  try {
    const { user_id, phone, speciality, national_id } = req.body;
    const licenceFile = req.file;

    if (!user_id || !phone || !speciality || !national_id) {
      return res.status(400).json({ error: 'user_id, phone, speciality and national_id are required' });
    }

    // Ensure user exists
    const { rows: userRows } = await pool.query('SELECT id, role FROM users WHERE id = $1', [user_id]);
    if (!userRows[0]) return res.status(400).json({ error: 'User not found' });

    // Ensure user has doctor role
    if (userRows[0].role !== 'doctor') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['doctor', user_id]);
    }

    let licence_file_path = null;

    // Upload license file if provided
    if (licenceFile) {
      try {
        const formData = new FormData();
        formData.append('file', licenceFile.buffer, {
          filename: licenceFile.originalname,
          contentType: licenceFile.mimetype
        });

        const uploadResponse = await axios.post(
          'https://file-vault-ro9o.onrender.com/upload',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'accept': 'application/json'
            }
          }
        );

        if (uploadResponse.data && uploadResponse.data.path) {
          licence_file_path = uploadResponse.data.path;
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload license file' });
      }
    }

    const insertQuery = `
      INSERT INTO doctors (user_id, phone, speciality, licence_file_path, national_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, phone, speciality, licence_file_path, national_id, status, created_at
    `;

    const { rows } = await pool.query(insertQuery, [
      user_id,
      phone,
      speciality,
      licence_file_path,
      national_id,
      'pending'
    ]);

    res.status(201).json({ message: 'Doctor profile created', doctor: rows[0] });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update doctor status by doctor id
exports.updateDoctorStatus = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { status } = req.body;

    if (!doctorId) return res.status(400).json({ error: 'Doctor id is required in the path' });
    if (!status) return res.status(400).json({ error: 'status is required in the body' });

    const allowed = ['pending', 'approved', 'rejected'];
    const normalized = String(status).toLowerCase();
    if (!allowed.includes(normalized)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const { rows: existing } = await pool.query('SELECT id, user_id, status FROM doctors WHERE id = $1', [doctorId]);
    if (!existing[0]) return res.status(404).json({ error: 'Doctor not found' });

    const { rows } = await pool.query(
      'UPDATE doctors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, user_id, phone, speciality, licence_file_path, national_id, status, created_at, updated_at',
      [normalized, doctorId]
    );

    // Optionally sync user status when doctor approved/rejected
    try {
      if (normalized === 'approved') {
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['approved', rows[0].user_id]);
      } else if (normalized === 'rejected') {
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['rejected', rows[0].user_id]);
      }
    } catch (err) {
      console.error('Sync user status error:', err);
    }

    res.json({ message: 'Doctor status updated', doctor: rows[0] });
  } catch (error) {
    console.error('Update doctor status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload or update user profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    const { user_id } = req.body;

    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    // Ensure user exists
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (!userRows[0]) return res.status(400).json({ error: 'User not found' });

    if (!file) return res.status(400).json({ error: 'Image file is required' });

    let image_path = null;

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const uploadResponse = await axios.post(
        'https://file-vault-ro9o.onrender.com/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'accept': 'application/json'
          }
        }
      );

      if (uploadResponse.data && uploadResponse.data.path) {
        image_path = uploadResponse.data.path;
      } else {
        console.error('Unexpected upload response:', uploadResponse.data);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    } catch (uploadError) {
      console.error('File upload error:', uploadError && uploadError.response ? uploadError.response.data : uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const upsertQuery = `
      INSERT INTO profile_images (user_id, image_path, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET image_path = EXCLUDED.image_path, updated_at = NOW()
      RETURNING user_id, image_path, created_at, updated_at
    `;

    const { rows } = await pool.query(upsertQuery, [user_id, image_path]);

    res.json({ message: 'Profile image saved', profile: rows[0] });
  } catch (error) {
    console.error('uploadProfileImage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or update user profile (medical/profile details)
exports.upsertUserProfile = async (req, res) => {
  try {
    const {
      user_id,
      dob,
      gender,
      phone,
      blood_group,
      allergies,
      chronic_conditions,
      current_medications,
      emergency_contact_name,
      address
    } = req.body;

    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    // Ensure user exists
    const { rows: userRows } = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (!userRows[0]) return res.status(400).json({ error: 'User not found' });

    // Normalize JSON fields: allow passing arrays or JSON strings
    const parseMaybeArray = (val) => {
      if (!val) return null;
      if (Array.isArray(val)) return val;
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [String(val)]; } catch { return [String(val)]; }
    };

    const allergiesArr = parseMaybeArray(allergies);
    const chronicArr = parseMaybeArray(chronic_conditions);
    const medsArr = parseMaybeArray(current_medications);

    const upsertQuery = `
      INSERT INTO user_profiles (user_id, dob, gender, phone, blood_group, allergies, chronic_conditions, current_medications, emergency_contact_name, address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        dob = EXCLUDED.dob,
        gender = EXCLUDED.gender,
        phone = EXCLUDED.phone,
        blood_group = EXCLUDED.blood_group,
        allergies = EXCLUDED.allergies,
        chronic_conditions = EXCLUDED.chronic_conditions,
        current_medications = EXCLUDED.current_medications,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        address = EXCLUDED.address,
        updated_at = NOW()
      RETURNING *
    `;

    const { rows } = await pool.query(upsertQuery, [
      user_id,
      dob || null,
      gender || null,
      phone || null,
      blood_group || null,
      allergiesArr ? JSON.stringify(allergiesArr) : null,
      chronicArr ? JSON.stringify(chronicArr) : null,
      medsArr ? JSON.stringify(medsArr) : null,
      emergency_contact_name || null,
      address || null
    ]);

    res.json({ message: 'User profile saved', profile: rows[0] });
  } catch (error) {
    console.error('upsertUserProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile by user_id
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required in path' });

    const { rows } = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Profile not found' });

    res.json(rows[0]);
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Preview a profile image by path (forwards to file-vault preview endpoint)
exports.previewProfileImage = async (req, res) => {
  try {
    const imagePath = req.query.path || req.body.path;
    if (!imagePath) return res.status(400).json({ error: 'path query parameter is required' });

    try {
      const resp = await axios.get('https://file-vault-ro9o.onrender.com/preview', {
        params: { path: imagePath },
        headers: { accept: 'application/json' }
      });

      // Return preview_url if present otherwise return full response
      if (resp.data && resp.data.preview_url) {
        return res.json({ preview_url: resp.data.preview_url });
      }
      return res.json(resp.data || {});
    } catch (err) {
      console.error('previewProfileImage upstream error:', err && err.response ? err.response.data : err);
      return res.status(502).json({ error: 'Failed to fetch preview from file vault' });
    }
  } catch (error) {
    console.error('previewProfileImage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};