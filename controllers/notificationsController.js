const pool = require('../config/db');

// GET /api/notifications/sent/:doctorId
exports.getSentNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.title, n.message, n.type, n.user_id,
              u.name AS patient_name,
              n.sent_by_id, COALESCE(s.name, 'System') AS sent_by,
              n.is_read, n.created_at
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       LEFT JOIN users s ON n.sent_by_id = s.id
       WHERE n.sent_by_id = $1
       ORDER BY n.created_at DESC`,
      [req.params.doctorId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent notifications' });
  }
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.title, n.message, n.type, n.user_id,
              u.name AS user_name, u.email AS user_email, u.role AS user_role,
              n.sent_by_id, COALESCE(s.name, 'System') AS sent_by,
              n.is_read, n.created_at
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       LEFT JOIN users s ON n.sent_by_id = s.id
       ORDER BY n.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/notifications/user/:user_id
exports.getUserNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.id, n.title, n.message, n.type, n.user_id,
              COALESCE(s.name, 'System') AS sent_by,
              n.sent_by_id, n.is_read, n.created_at
       FROM notifications n
       LEFT JOIN users s ON n.sent_by_id = s.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [req.params.user_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/notifications/user/:user_id/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS unread_count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.params.user_id]
    );
    res.json({ unread_count: rows[0].unread_count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/notifications
exports.createNotification = async (req, res) => {
  const { title, message, type, user_id, sent_by_id } = req.body;
  if (!title || !message || !user_id) {
    return res.status(400).json({ error: 'title, message and user_id are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO notifications (title, message, type, user_id, sent_by_id, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING id, title, message, type, user_id, sent_by_id, is_read, created_at`,
      [title, message, type || 'general', user_id, sent_by_id || null]
    );
    const notification = rows[0];
    if (sent_by_id) {
      const { rows: senderRows } = await pool.query('SELECT name FROM users WHERE id = $1', [sent_by_id]);
      notification.sent_by = senderRows[0] ? senderRows[0].name : 'System';
    } else {
      notification.sent_by = 'System';
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1
       RETURNING id, is_read, NOW() AS updated_at`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/notifications/appointment-status
exports.appointmentStatusNotification = async (req, res) => {
  const { appointment_id, patient_id, doctor_id, status, appointment_date, appointment_time } = req.body;
  if (!appointment_id || !patient_id || !doctor_id || !status) {
    return res.status(400).json({ error: 'appointment_id, patient_id, doctor_id and status are required' });
  }
  try {
    const { rows: doctorRows } = await pool.query('SELECT name FROM users WHERE id = $1', [doctor_id]);
    const doctorName = doctorRows[0] ? doctorRows[0].name : 'Doctor';

    const statusMap = {
      approved: { title: 'Appointment Approved', type: 'success' },
      rejected: { title: 'Appointment Rejected', type: 'error' },
      pending:  { title: 'Appointment Pending',  type: 'info' }
    };
    const { title, type } = statusMap[status] || { title: 'Appointment Update', type: 'info' };

    const formattedDate = appointment_date
      ? new Date(appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : appointment_date;
    const message = `Your appointment on ${formattedDate} at ${appointment_time} has been ${status} by ${doctorName}`;

    const { rows } = await pool.query(
      `INSERT INTO notifications (title, message, type, user_id, sent_by_id, appointment_id, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING id, title, message, type, user_id, sent_by_id, appointment_id, is_read, created_at`,
      [title, message, type, patient_id, doctor_id, appointment_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/notifications/:id
exports.updateNotification = async (req, res) => {
  const { title, message, type, user_id, is_read } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE notifications SET
        title = COALESCE($1, title),
        message = COALESCE($2, message),
        type = COALESCE($3, type),
        user_id = COALESCE($4, user_id),
        is_read = COALESCE($5, is_read)
       WHERE id = $6
       RETURNING id, title, message, type, user_id, is_read, created_at`,
      [title || null, message || null, type || null, user_id || null, is_read ?? null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Notification not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM notifications WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role FROM users ORDER BY name ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
