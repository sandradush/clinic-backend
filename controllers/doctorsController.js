const pool = require('../config/db');

// GET /api/doctors — all approved doctors with full details
exports.getDoctors = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id::text AS id, u.name, d.speciality AS specialty, u.email, d.phone,
              d.availability, d.status
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.status = 'approved'
       ORDER BY u.name ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/doctors/:doctorId/availability
exports.updateAvailability = async (req, res) => {
  const { doctorId } = req.params;
  const { availability } = req.body;
  if (!availability) return res.status(400).json({ error: 'availability is required' });

  const allowed = ['online', 'offline', 'busy'];
  if (!allowed.includes(availability)) {
    return res.status(400).json({ error: `availability must be one of: ${allowed.join(', ')}` });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE doctors SET availability = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING user_id::text AS id, availability, status`,
      [availability, doctorId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Availability updated', doctor: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/doctor-requests — all pending doctor requests
exports.getDoctorRequests = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id::text AS id, u.name, u.email, d.phone,
              d.speciality AS specialty, d.national_id AS "licenseNumber",
              d.licence_file_path, d.status, d.created_at AS "requestDate"
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.status = 'pending'
       ORDER BY d.created_at DESC`
    );

    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      specialty: r.specialty,
      licenseNumber: r.licenseNumber,
      requestDate: r.requestDate,
      status: r.status,
      documents: r.licence_file_path ? [r.licence_file_path] : []
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/doctor-requests/:requestId — approve or reject a doctor request
exports.updateDoctorRequest = async (req, res) => {
  const { requestId } = req.params;
  const { status, adminNotes } = req.body;

  const allowed = ['approved', 'rejected'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  try {
    const { rows: existing } = await pool.query(
      'SELECT id, user_id FROM doctors WHERE id = $1',
      [requestId]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Doctor request not found' });

    const { rows } = await pool.query(
      `UPDATE doctors SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id::text, user_id, status, updated_at`,
      [status, requestId]
    );

    // Sync user status
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, existing[0].user_id]);

    res.json({ message: `Doctor request ${status}`, doctor: rows[0], adminNotes: adminNotes || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
