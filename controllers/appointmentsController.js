// Get appointment statistics for a patient
exports.getPatientAppointmentStats = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Total appointments
    const { rows: totalRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM appointments WHERE patient_id = $1`,
      [patientId]
    );
    const total = totalRows[0]?.total || 0;

    // Today's appointments
    const { rows: todayRows } = await pool.query(
      `SELECT COUNT(*)::int AS today FROM appointments WHERE patient_id = $1 AND date = CURRENT_DATE`,
      [patientId]
    );
    const today = todayRows[0]?.today || 0;

    // Pending appointments
    const { rows: pendingRows } = await pool.query(
      `SELECT COUNT(*)::int AS pending FROM appointments WHERE patient_id = $1 AND COALESCE(status, 'pending') = 'pending'`,
      [patientId]
    );
    const pending = pendingRows[0]?.pending || 0;

    // Last appointment info
    const { rows: lastRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time DESC, a.created_at DESC
       LIMIT 1`,
      [patientId]
    );
    const lastAppointment = lastRows[0] || null;

    res.json({ total, today, pending, lastAppointment });
  } catch (error) {
    console.error('Get patient appointment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const pool = require('../config/db');
const { notifyAdminNewAppointment, notifyDoctorAssigned, notifyPatientApproved, notifyPatientRejected } = require('../services/emailService');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, description } = req.body;
    if (!patient_id || !date || !time) {
      return res.status(400).json({ error: 'patient_id, date and time are required' });
    }

    const { rows: insertRows } = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [patient_id, doctor_id || null, date, time, description || null]
    );

    const newId = insertRows[0].id;

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [newId]
    );

    const appt = rows[0];
    const { rows: adminRows } = await pool.query(`SELECT email FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminRows[0]) notifyAdminNewAppointment(adminRows[0].email, appt.patient_name);

    res.status(201).json(appt);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get approved appointments
exports.getApprovedAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.status = 'approved'
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get approved appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pending appointments
exports.getPendingAppointments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE COALESCE(a.status, 'pending') = 'pending'
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointment by id
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments by doctor id
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
       ORDER BY a.created_at DESC`,
      [doctorId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments by doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointments by patient id
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.created_at DESC`,
      [patientId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get appointments by patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get statistics for a doctor: counts by status and today's appointments
exports.getDoctorStatistics = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Counts grouped by status
    const { rows: countRows } = await pool.query(
      `SELECT COALESCE(status, 'pending') AS status, COUNT(*)::int AS count
       FROM appointments
       WHERE doctor_id = $1
       GROUP BY COALESCE(status, 'pending')`,
      [doctorId]
    );

    const counts = { pending: 0, approved: 0, rejected: 0 };
    countRows.forEach(r => {
      const key = (r.status || 'pending').toString();
      counts[key] = r.count;
    });

    // Today's appointments for the doctor
    const { rows: todayRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
         AND a.date::date BETWEEN (CURRENT_DATE - INTERVAL '1 day')::date AND (CURRENT_DATE + INTERVAL '1 day')::date
       ORDER BY a.time ASC`,
      [doctorId]
    );

    res.json({ counts, todayAppointments: todayRows });
  } catch (error) {
    console.error('Get doctor statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `Status is required and must be one of: ${allowed.join(', ')}` });
    }

    const { rows: updateRows } = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id',
      [status, id]
    );

    if (!updateRows[0]) return res.status(404).json({ error: 'Appointment not found' });

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    const appt = rows[0];
    const { rows: patientRows } = await pool.query(`SELECT email FROM users WHERE id = $1`, [appt.patient_id]);
    if (patientRows[0]) {
      if (status === 'approved') notifyPatientApproved(patientRows[0].email);
      else if (status === 'rejected') notifyPatientRejected(patientRows[0].email);
    }

    res.json(appt);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment (general update for any fields)
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = ['status', 'summary', 'payment_status', 'description', 'doctor_id'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(id); // Add id as last parameter
    
    const { rows: updateRows } = await pool.query(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id`,
      values
    );
    
    if (!updateRows[0]) return res.status(404).json({ error: 'Appointment not found' });
    
    // Return updated appointment
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.summary, a.payment_status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve an appointment (sets status = 'approved')
exports.approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: updateRows } = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id",
      ['approved', id]
    );

    if (!updateRows[0]) return res.status(404).json({ error: 'Appointment not found' });

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    const appt = rows[0];
    const { rows: patientRows } = await pool.query(`SELECT email FROM users WHERE id = $1`, [appt.patient_id]);
    if (patientRows[0]) notifyPatientApproved(patientRows[0].email);

    res.json(appt);
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Appointment summary: appointment + prescriptions + symptoms + medicals
exports.getAppointmentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Appointment with patient and doctor names
    const { rows: apptRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    const appointment = apptRows[0];
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Prescriptions
    const { rows: prescriptions } = await pool.query(
      `SELECT id, appointment_id, title, note, created_at
       FROM prescriptions
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Symptoms
    const { rows: symptoms } = await pool.query(
      `SELECT id, appointment_id, symptom_name, value, description, created_at
       FROM symptoms
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Medicals
    const { rows: medicals } = await pool.query(
      `SELECT id, appointment_id, medical_name, dosage, frequency, note, created_at
       FROM medicals
       WHERE appointment_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({ appointment, prescriptions, symptoms, medicals });
  } catch (error) {
    console.error('Get appointment summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get appointment summaries for a doctor (all appointments for doctor with associated prescriptions, symptoms, medicals)
exports.getAppointmentSummaryByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get appointments for the doctor
    const { rows: apptRows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1
       ORDER BY a.date DESC, a.time DESC`,
      [doctorId]
    );

    if (!apptRows.length) return res.json([]);

    // For each appointment, fetch prescriptions, symptoms and medicals
    const summaries = [];
    for (const appt of apptRows) {
      const apptId = appt.id;

      const { rows: prescriptions } = await pool.query(
        `SELECT id, appointment_id, title, note, created_at
         FROM prescriptions
         WHERE appointment_id = $1
         ORDER BY created_at DESC`,
        [apptId]
      );

      const { rows: symptoms } = await pool.query(
        `SELECT id, appointment_id, symptom_name, value, description, created_at
         FROM symptoms
         WHERE appointment_id = $1
         ORDER BY created_at DESC`,
        [apptId]
      );

      const { rows: medicals } = await pool.query(
        `SELECT id, appointment_id, medical_name, dosage, frequency, note, created_at
         FROM medicals
         WHERE appointment_id = $1
         ORDER BY created_at DESC`,
        [apptId]
      );

      summaries.push({ appointment: appt, prescriptions, symptoms, medicals });
    }

    res.json(summaries);
  } catch (error) {
    console.error('Get appointment summaries by doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create appointment without doctor (doctor_id will be NULL)
exports.createAppointmentNoDoctor = async (req, res) => {
  try {
    // Accept same params as normal create but force doctor_id to NULL
    const { patient_id, doctor_id: _ignored_doctor_id, date, time, description } = req.body;
    if (!patient_id || !date || !time) {
      return res.status(400).json({ error: 'patient_id, date and time are required' });
    }

    const { rows: insertRows } = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [patient_id, null, date, time, description || null]
    );

    const newId = insertRows[0].id;

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [newId]
    );

    const appt = rows[0];
    const { rows: adminRows } = await pool.query(`SELECT email FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminRows[0]) notifyAdminNewAppointment(adminRows[0].email, appt.patient_name);

    res.status(201).json(appt);
  } catch (error) {
    console.error('Create appointment (no doctor) error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Create appointment with provided doctor_name but no doctor_id (doctor_id = NULL)
// This does NOT create or modify any user records; it only returns doctor_name in response.
// (removed) createAppointmentWithDoctorName — endpoint /api/appointments/t2 was removed

// Get appointments waiting for doctor (doctor_id IS NULL)
exports.getWaitingPatients = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.doctor_id IS NULL
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get waiting patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment's doctor_id (assign a doctor)
exports.updateAppointmentDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;
    if (doctor_id === undefined || doctor_id === null) {
      return res.status(400).json({ error: 'doctor_id is required in request body' });
    }

    const { rows: updateRows } = await pool.query(
      'UPDATE appointments SET doctor_id = $1 WHERE id = $2 RETURNING id',
      [doctor_id, id]
    );

    if (!updateRows[0]) return res.status(404).json({ error: 'Appointment not found' });

    const { rows } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    const appt = rows[0];
    const { rows: doctorRows } = await pool.query(`SELECT email FROM users WHERE id = $1`, [doctor_id]);
    if (doctorRows[0]) notifyDoctorAssigned(doctorRows[0].email);

    res.json(appt);
  } catch (error) {
    console.error('Update appointment doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Get patient summary: patient info + all appointments with doctor names
exports.getPatientSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient info
    const { rows: patientRows } = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE id = $1`,
      [patientId]
    );

    if (!patientRows[0]) return res.status(404).json({ error: 'Patient not found' });

    const patient = patientRows[0];

    // Get all appointments for the patient
    const { rows: appointments } = await pool.query(
      `SELECT a.id, a.date, a.time, a.description, a.status, a.created_at,
              a.patient_id, p.name AS patient_name,
              a.doctor_id, d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time DESC`,
      [patientId]
    );

    res.json({ patient, appointments });
  } catch (error) {
    console.error('Get patient summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};