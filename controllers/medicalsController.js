const pool = require('../config/db');

// Create a medical record for an appointment
exports.createMedical = async (req, res) => {
  try {
    const { appointment_id, medical_name, dosage, frequency, note } = req.body;
    if (!appointment_id || !medical_name) {
      return res.status(400).json({ error: 'appointment_id and medical_name are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO medicals (appointment_id, medical_name, dosage, frequency, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, appointment_id, medical_name, dosage, frequency, note, created_at`,
      [appointment_id, medical_name, dosage || null, frequency || null, note || null]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create medical error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get medicals for an appointment
exports.getMedicalsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, medical_name, dosage, frequency, note, created_at
       FROM medicals
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get medicals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get medical by id
exports.getMedicalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, medical_name, dosage, frequency, note, created_at
       FROM medicals
       WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Medical not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get medical error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
