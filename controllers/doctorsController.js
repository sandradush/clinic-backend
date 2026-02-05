const pool = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, specialty, phone, created_at, status, 'doctors' as source
      FROM doctors
      UNION ALL
      SELECT id, name, NULL as specialty, NULL as phone, created_at, status, 'users' as source
      FROM users WHERE role = 'doctor'
      ORDER BY id`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (rows.length > 0) return res.json(rows[0]);

    const { rows: userRows } = await pool.query('SELECT id, name, NULL AS specialty, NULL AS phone, created_at, status FROM users WHERE id = $1 AND role = $2', [req.params.id, 'doctor']);
    if (userRows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(userRows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, specialty, phone } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO doctors (name, specialty, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, specialty, phone]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { name, specialty, phone } = req.body;
    const { rows } = await pool.query(
      'UPDATE doctors SET name = $1, specialty = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, specialty, phone, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingDoctors = async (req, res) => {
  try {
    const sql = `
      SELECT id,name,email,role,created_at,status
      FROM users WHERE role = 'doctor' AND status = $1
      ORDER BY id`;
    const result = await pool.query(sql, ['pending']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['pending', 'approved', 'rejected'];
    if (!status || typeof status !== 'string' || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing "status". Allowed: pending, approved, rejected' });
    }

    // Try updating in `doctors` table first
    const { rows } = await pool.query(
      'UPDATE doctors SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length > 0) return res.json(rows[0]);

    // Fallback: update in `users` table where role = 'doctor'
    const { rows: userRows } = await pool.query(
      "UPDATE users SET status = $1 WHERE id = $2 AND role = 'doctor' RETURNING id, name, NULL AS specialty, NULL AS phone, created_at, status",
      [status, req.params.id]
    );
    if (userRows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(userRows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
  ,
  getPendingDoctors,
  updateDoctorStatus
};