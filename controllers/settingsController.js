const pool = require('../config/db');

const ALLOWED_LANGUAGES = ['English', 'French', 'Kinyarwanda'];

exports.saveGeneralSettings = async (req, res) => {
  try {
    const { clinicName, defaultLanguage, primaryAddress } = req.body;

    if (!clinicName || typeof clinicName !== 'string' || !clinicName.trim()) {
      return res.status(400).json({ error: 'clinicName is required' });
    }

    if (!defaultLanguage || !ALLOWED_LANGUAGES.includes(defaultLanguage)) {
      return res.status(400).json({ error: `defaultLanguage must be one of: ${ALLOWED_LANGUAGES.join(', ')}` });
    }

    if (!primaryAddress || typeof primaryAddress !== 'string' || !primaryAddress.trim()) {
      return res.status(400).json({ error: 'primaryAddress is required' });
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

    res.json({
      message: 'General settings saved',
      data: rows[0]
    });
  } catch (error) {
    console.error('Save general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetGeneralSettings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE general_settings
       SET clinic_name = '',
           default_language = 'English',
           primary_address = '',
           updated_at = NOW()
       WHERE id = 1
       RETURNING clinic_name AS "clinicName",
                 default_language AS "defaultLanguage",
                 primary_address AS "primaryAddress",
                 created_at,
                 updated_at`
    );

    if (!rows[0]) {
      const { rows: insertedRows } = await pool.query(
        `INSERT INTO general_settings (id, clinic_name, default_language, primary_address)
         VALUES (1, '', 'English', '')
         RETURNING clinic_name AS "clinicName",
                   default_language AS "defaultLanguage",
                   primary_address AS "primaryAddress",
                   created_at,
                   updated_at`
      );

      return res.json({
        message: 'General settings reset',
        data: insertedRows[0]
      });
    }

    res.json({
      message: 'General settings reset',
      data: rows[0]
    });
  } catch (error) {
    console.error('Reset general settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
