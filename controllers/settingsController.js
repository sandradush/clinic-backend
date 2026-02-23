const pool = require('../config/db');

const ALLOWED_LANGUAGES = ['English', 'French', 'Kinyarwanda'];

exports.getGeneralSettings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT clinic_name AS "clinicName",
              default_language AS "defaultLanguage",
              primary_address AS "primaryAddress",
              created_at,
              updated_at
       FROM general_settings
       WHERE id = 1`
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'General settings not configured yet' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.upsertGeneralSettings = async (req, res) => {
  try {
    const { clinicName, defaultLanguage, primaryAddress } = req.body;

    if (!clinicName || typeof clinicName !== 'string' || !clinicName.trim()) {
      return res.status(400).json({ error: 'clinicName is required' });
    }

    if (!primaryAddress || typeof primaryAddress !== 'string' || !primaryAddress.trim()) {
      return res.status(400).json({ error: 'primaryAddress is required' });
    }

    if (!defaultLanguage || !ALLOWED_LANGUAGES.includes(defaultLanguage)) {
      return res.status(400).json({ error: `defaultLanguage must be one of: ${ALLOWED_LANGUAGES.join(', ')}` });
    }

    const { rows } = await pool.query(
      `INSERT INTO general_settings (id, clinic_name, default_language, primary_address)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id)
       DO UPDATE SET
         clinic_name = EXCLUDED.clinic_name,
         default_language = EXCLUDED.default_language,
         primary_address = EXCLUDED.primary_address,
         updated_at = NOW()
       RETURNING clinic_name AS "clinicName",
                 default_language AS "defaultLanguage",
                 primary_address AS "primaryAddress",
                 created_at,
                 updated_at`,
      [clinicName.trim(), defaultLanguage, primaryAddress.trim()]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Upsert general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
