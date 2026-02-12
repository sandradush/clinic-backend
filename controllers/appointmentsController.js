const pool = require('../config/db');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, description } = req.body;
    if (!patient_id || !doctor_id || !date || !time) {
      return res.status(400).json({ error: 'patient_id, doctor_id, date and time are required' });
    }

    const { rows: insertRows } = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [patient_id, doctor_id, date, time, description || null]
    );

    const newId = insertRows[0].id;

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [newId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get approved appointments
exports.getApprovedAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.status = 'approved'
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get approved appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pending appointments
exports.getPendingAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE COALESCE(a.status, 'pending') = 'pending'
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointment by id
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments by doctor id
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
       ORDER BY a.created_at DESC`,
      [doctorId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments by doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get statistics for a doctor: counts by status and today's appointments
exports.getDoctorStatistics = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Counts grouped by status
    const { rows: countRows } = await pool.query(
      `SELECT COALESCE(status, 'pending') AS status, COUNT(*)::int AS count
       FROM appointments
       WHERE doctor_id = $1
       GROUP BY COALESCE(status, 'pending')`,
      [doctorId]
    );

    const counts = { pending: 0, approved: 0, rejected: 0 };
    countRows.forEach(r => {
      const key = (r.status || 'pending').toString();
      counts[key] = r.count;
    });

    // Today's appointments for the doctor
    const { rows: todayRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
         AND a.date::date BETWEEN (CURRENT_DATE - INTERVAL '1 day')::date AND (CURRENT_DATE + INTERVAL '1 day')::date
       ORDER BY a.time ASC`,
      [doctorId]
    );

    res.json({ counts, todayAppointments: todayRows });
  } catch (error) {
    console.error('Get doctor statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `Status is required and must be one of: ${allowed.join(', ')}` });
    }

    const { rows: updateRows } = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id',
      [status, id]
    );

    if (!updateRows[0]) return res.status(404).json({ error: 'Appointment not found' });

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Appointment summary: appointment + perceptions + symptoms + medicals
exports.getAppointmentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Appointment with patient and doctor names
    const { rows: apptRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    const appointment = apptRows[0];
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Perceptions
    const { rows: perceptions } = await pool.query(
      `SELECT id, appointment_id, title, note, created_at
       FROM perceptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Symptoms
    const { rows: symptoms } = await pool.query(
      `SELECT id, appointment_id, symptom_name, value, description, created_at
       FROM symptoms
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Medicals
    const { rows: medicals } = await pool.query(
      `SELECT id, appointment_id, medical_name, dosage, frequency, note, created_at
       FROM medicals
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({ appointment, perceptions, symptoms, medicals });
  } catch (error) {
    console.error('Get appointment summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
