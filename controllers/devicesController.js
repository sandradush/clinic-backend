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
