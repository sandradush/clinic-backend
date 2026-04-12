const pool = require('../config/db');

exports.getAllRecords = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT record_id, consultation_id, file_url, description FROM medical_records ORDER BY record_id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRecord = async (req, res) => {
  const { consultation_id, file_url, description } = req.body;
  if (!consultation_id || !file_url) {
    return res.status(400).json({ error: 'consultation_id and file_url are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO medical_records (consultation_id, file_url, description)
       VALUES ($1, $2, $3)
       RETURNING record_id, consultation_id, file_url, description`,
      [consultation_id, file_url, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT record_id, consultation_id, file_url, description FROM medical_records WHERE record_id = $1`,
      [req.params.record_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Medical record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  const { consultation_id, file_url, description } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE medical_records SET
        consultation_id = COALESCE($1, consultation_id),
        file_url = COALESCE($2, file_url),
        description = COALESCE($3, description)
       WHERE record_id = $4
       RETURNING record_id, consultation_id, file_url, description`,
      [consultation_id || null, file_url || null, description || null, req.params.record_id]
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
