const pool = require('../config/db');

// Register or reassign a device to a patient
exports.registerDeviceToPatient = async (req, res) => {
  try {
    const { patient_id, device_serial_number } = req.body;

    if (!patient_id || !device_serial_number) {
      return res.status(400).json({ error: 'patient_id and device_serial_number are required' });
    }

    const patientId = Number(patient_id);
    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ error: 'patient_id must be a valid positive integer' });
    }

    const serialNumber = String(device_serial_number).trim();
    if (!serialNumber) {
      return res.status(400).json({ error: 'device_serial_number cannot be empty' });
    }

    const { rows: patientRows } = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [patientId]
    );

    if (!patientRows[0]) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO patient_devices (patient_id, device_serial_number)
       VALUES ($1, $2)
       ON CONFLICT (device_serial_number)
       DO UPDATE SET patient_id = EXCLUDED.patient_id, updated_at = NOW()
       RETURNING id, patient_id, device_serial_number, created_at, updated_at`,
      [patientId, serialNumber]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve vitals captured by devices registered to a patient
exports.getPatientDeviceReadings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const parsedPatientId = Number(patientId);

    if (!Number.isInteger(parsedPatientId) || parsedPatientId <= 0) {
      return res.status(400).json({ error: 'patientId must be a valid positive integer' });
    }

    const limitRaw = req.query.limit;
    const latestRaw = req.query.latest;
    const latest = latestRaw === 'true' || latestRaw === '1';
    let limit = 50;
    if (latest) {
      limit = 1;
    } else if (limitRaw !== undefined) {
      const parsedLimit = Number(limitRaw);
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: 'limit must be a valid positive integer' });
      }
      limit = Math.min(parsedLimit, 200);
    }

    const { rows } = await pool.query(
      `SELECT pd.patient_id,
              pd.device_serial_number,
              v.id AS vital_id,
              v.heart_rate_bpm,
              v.spo2,
              v.temperature,
              v.created_at
       FROM patient_devices pd
       LEFT JOIN vitals v ON v.serial_number = pd.device_serial_number
       WHERE pd.patient_id = $1
       ORDER BY v.created_at DESC NULLS LAST
       LIMIT $2`,
      [parsedPatientId, limit]
    );

    if (latest) {
      return res.json(rows[0] || null);
    }

    res.json(rows);
  } catch (error) {
    console.error('Get patient device readings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
