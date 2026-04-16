const pool = require('../config/db');

// Create a prescription for an appointment
exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, title, note } = req.body;
    if (!appointment_id || !title) {
      return res.status(400).json({ error: 'appointment_id and title are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO prescriptions (appointment_id, title, note)
       VALUES ($1, $2, $3)
       RETURNING id, appointment_id, title, note, created_at`,
      [appointment_id, title, note || null]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get prescriptions for a patient (across all appointments)
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { rows } = await pool.query(
      `SELECT p.id, p.appointment_id, p.title, p.note, p.created_at,
              a.date, a.time, a.patient_name, a.doctor_name
       FROM prescriptions p
       LEFT JOIN (
         SELECT a.id, a.date, a.time, 
                pat.name AS patient_name, 
                doc.name AS doctor_name
         FROM appointments a
         LEFT JOIN users pat ON a.patient_id = pat.id
         LEFT JOIN users doc ON a.doctor_id = doc.id
       ) a ON p.appointment_id = a.id
       WHERE a.id IN (
         SELECT id FROM appointments WHERE patient_id = $1
       )
       ORDER BY p.created_at DESC`,
      [patientId]
    );
    
    // Format response to include appointment details
    const formattedRows = rows.map(row => ({
      id: row.id,
      appointment_id: row.appointment_id,
      title: row.title,
      note: row.note,
      created_at: row.created_at,
      appointment: row.date ? {
        date: row.date,
        time: row.time,
        patient_name: row.patient_name,
        doctor_name: row.doctor_name
      } : null
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get prescriptions for an appointment
exports.getPrescriptionsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, appointment_id, title, note, created_at
       FROM prescriptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
