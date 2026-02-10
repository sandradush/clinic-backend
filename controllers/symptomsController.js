const pool = require('../config/db');

// Create a symptom for an appointment
exports.createSymptom = async (req, res) => {
  try {
    const { appointment_id, symptom_name, value, description } = req.body;
    if (!appointment_id || !symptom_name) {
      return res.status(400).json({ error: 'appointment_id and symptom_name are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO symptoms (appointment_id, symptom_name, value, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, appointment_id, symptom_name, value, description, created_at`,
      [appointment_id, symptom_name, value || null, description || null]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get symptoms for an appointment
exports.getSymptomsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, symptom_name, value, description, created_at
       FROM symptoms
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get symptom by id
exports.getSymptomById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, symptom_name, value, description, created_at
       FROM symptoms
       WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Symptom not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get symptom error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments which have symptoms recorded today
exports.getAppointmentsWithSymptomsToday = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       JOIN symptoms s ON s.appointment_id = a.id
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE (s.created_at::date = CURRENT_DATE OR (s.created_at AT TIME ZONE 'UTC')::date = CURRENT_DATE)
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments with symptoms today error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments which have symptoms recorded today for a specific doctor
exports.getAppointmentsWithSymptomsTodayByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rows } = await pool.query(
      `SELECT DISTINCT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       JOIN symptoms s ON s.appointment_id = a.id
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
         AND (s.created_at::date = CURRENT_DATE OR (s.created_at AT TIME ZONE 'UTC')::date = CURRENT_DATE)
       ORDER BY a.created_at DESC`,
      [doctorId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments with symptoms today by doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
