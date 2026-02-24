const pool = require('../config/db');

// Create a prescription for an appointment
exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, title, note } = req.body;
    if (!appointment_id || !title) {
      return res.status(400).json({ error: 'appointment_id and title are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO prescriptions (appointment_id, title, note)
       VALUES ($1, $2, $3)
       RETURNING id, appointment_id, title, note, created_at`,
      [appointment_id, title, note || null]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get prescriptions for an appointment
exports.getPrescriptionsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, title, note, created_at
       FROM prescriptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
