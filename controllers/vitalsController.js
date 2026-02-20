const pool = require('../config/db');

// Create a vitals record from a device
exports.createVital = async (req, res) => {
  try {
    const { heart_rate_bpm, spo2, serial_number, temperature } = req.body;

    if (
      heart_rate_bpm === undefined ||
      spo2 === undefined ||
      !serial_number ||
      temperature === undefined
    ) {
      return res.status(400).json({
        error: 'heart_rate_bpm, spo2, serial_number and temperature are required'
      });
    }

    const heartRate = Number(heart_rate_bpm);
    const oxygenLevel = Number(spo2);
    const bodyTemperature = Number(temperature);

    if (
      Number.isNaN(heartRate) ||
      Number.isNaN(oxygenLevel) ||
      Number.isNaN(bodyTemperature)
    ) {
      return res.status(400).json({
        error: 'heart_rate_bpm, spo2 and temperature must be valid numbers'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO vitals (heart_rate_bpm, spo2, serial_number, temperature)
       VALUES ($1, $2, $3, $4)
       RETURNING id, heart_rate_bpm, spo2, serial_number, temperature, created_at`,
      [heartRate, oxygenLevel, serial_number, bodyTemperature]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create vitals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
