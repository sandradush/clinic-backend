const pool = require('../config/db');

// Create a perception for an appointment
exports.createPerception = async (req, res) => {
  try {
    const { appointment_id, title, note } = req.body;
    if (!appointment_id || !title) {
      return res.status(400).json({ error: 'appointment_id and title are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO perceptions (appointment_id, title, note)
       VALUES ($1, $2, $3)
       RETURNING id, appointment_id, title, note, created_at`,
      [appointment_id, title, note || null]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create perception error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get perceptions for an appointment
exports.getPerceptionsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, title, note, created_at
       FROM perceptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get perceptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
