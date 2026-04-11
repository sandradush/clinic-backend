const pool = require('../config/db');
const crypto = require('crypto');

exports.initiateCall = async (req, res) => {
  const { caller_id, receiver_id, appointment_id } = req.body;
  if (!caller_id || !receiver_id) {
    return res.status(400).json({ error: 'caller_id and receiver_id are required' });
  }
  try {
    const room_id = crypto.randomBytes(8).toString('hex');
    await pool.query(
      `INSERT INTO call_logs (room_id, caller_id, receiver_id, appointment_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [room_id, caller_id, receiver_id, appointment_id || null]
    );
    res.json({ room_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
