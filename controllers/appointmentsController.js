const pool = require('../config/db');

const getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, scheduled_at, notes } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, scheduled_at, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [patient_id, doctor_id, scheduled_at, notes]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, scheduled_at, notes } = req.body;
    const { rows } = await pool.query(
      'UPDATE appointments SET patient_id = $1, doctor_id = $2, scheduled_at = $3, notes = $4 WHERE id = $5 RETURNING *',
      [patient_id, doctor_id, scheduled_at, notes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};