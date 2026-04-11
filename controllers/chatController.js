const pool = require('../config/db');

exports.getChatHistory = async (req, res) => {
  const { patient_id, doctor_id } = req.query;
  if (!patient_id || !doctor_id) {
    return res.status(400).json({ error: 'patient_id and doctor_id are required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, sender_id AS sender, receiver_id AS receiver, content, created_at AS timestamp
       FROM chat_messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [patient_id, doctor_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
