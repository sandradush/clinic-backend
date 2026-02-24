const pool = require('../config/db');

// Create a new clinic
exports.createClinic = async (req, res) => {
  try {
    const { name, primary_address, default_language } = req.body;

    if (!name || !primary_address || !default_language) {
      return res.status(400).json({ error: 'name, primary_address and default_language are required' });
    }

    const clinicName = String(name).trim();
    const address = String(primary_address).trim();
    const language = String(default_language).trim();

    if (!clinicName || !address || !language) {
      return res.status(400).json({ error: 'name, primary_address and default_language cannot be empty' });
    }

    const { rows } = await pool.query(
      `INSERT INTO clinics (name, primary_address, default_language)
       VALUES ($1, $2, $3)
       RETURNING id, name, primary_address, default_language, created_at`,
      [clinicName, address, language]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
