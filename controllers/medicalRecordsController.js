const pool = require('../config/db');

exports.getAllRecords = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mr.record_id, mr.consultation_id, mr.patient_id, mr.file_url, mr.description,
              p.name AS patient_name
       FROM medical_records mr
       LEFT JOIN users p ON mr.patient_id = p.id
       ORDER BY mr.record_id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRecord = async (req, res) => {
  const { consultation_id, patient_id, file_url, description } = req.body;
  if (!consultation_id || !patient_id || !file_url) {
    return res.status(400).json({ error: 'consultation_id, patient_id and file_url are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO medical_records (consultation_id, patient_id, file_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING record_id, consultation_id, patient_id, file_url, description`,
      [consultation_id, patient_id, file_url, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientRecords = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { rows } = await pool.query(
      `SELECT mr.record_id, mr.consultation_id, mr.patient_id, mr.file_url, mr.description,
              p.name AS patient_name,
              a.date AS appointment_date, a.time AS appointment_time,
              a.doctor_id, d.name AS doctor_name
       FROM medical_records mr
       LEFT JOIN users p ON mr.patient_id = p.id
       LEFT JOIN appointments a ON mr.consultation_id = a.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE mr.patient_id = $1
       ORDER BY mr.record_id DESC`,
      [patient_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  const { consultation_id, patient_id, file_url, description } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE medical_records SET
        consultation_id = COALESCE($1, consultation_id),
        patient_id = COALESCE($2, patient_id),
        file_url = COALESCE($3, file_url),
        description = COALESCE($4, description)
       WHERE record_id = $5
       RETURNING record_id, consultation_id, patient_id, file_url, description`,
      [consultation_id || null, patient_id || null, file_url || null, description || null, req.params.record_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Medical record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM medical_records WHERE record_id = $1 RETURNING record_id`,
      [req.params.record_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Medical record not found' });
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
