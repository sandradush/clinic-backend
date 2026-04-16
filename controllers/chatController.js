const pool = require('../config/db');
const { clients } = require('../ws/chatWs');

exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'sender_id, receiver_id, and content are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO chat_messages (sender_id, receiver_id, content, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id, sender_id AS sender, receiver_id AS receiver, content, created_at AS timestamp`,
      [sender_id, receiver_id, content]
    );
    const message = rows[0];

    // Deliver in real-time if receiver is connected via WebSocket
    const receiverWs = clients.get(String(receiver_id));
    if (receiverWs && receiverWs.readyState === 1) {
      receiverWs.send(JSON.stringify(message));
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  const patient_id = req.params.patient_id || req.query.patient_id;
  const { doctor_id } = req.query;
  if (!patient_id) {
    return res.status(400).json({ error: 'patient_id is required' });
  }
  try {
    let rows;
    if (doctor_id) {
      ({ rows } = await pool.query(
        `SELECT id, sender_id AS sender, receiver_id AS receiver, content, created_at AS timestamp
         FROM chat_messages
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC`,
        [patient_id, doctor_id]
      ));
    } else {
      ({ rows } = await pool.query(
        `SELECT id, sender_id AS sender, receiver_id AS receiver, content, created_at AS timestamp
         FROM chat_messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY created_at ASC`,
        [patient_id]
      ));
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
