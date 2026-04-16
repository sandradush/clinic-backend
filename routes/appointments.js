/**
 * @swagger
 * /api/appointments/patient/{patientId}/stats:
 *   get:
 *     summary: Get appointment statistics for a patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment statistics for the patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of appointments
 *                 today:
 *                   type: integer
 *                   description: Number of today's appointments
 *                 pending:
 *                   type: integer
 *                   description: Number of pending appointments
 *                 lastAppointment:
 *                   $ref: '#/components/schemas/Appointment'
 */
const express = require('express');
const router = express.Router();
const { getPatientAppointmentStats } = require('../controllers/appointmentsController');
router.get('/patient/:patientId/stats', getPatientAppointmentStats);
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  createAppointmentNoDoctor,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  updateAppointment,
  approveAppointment,
  getDoctorStatistics
} = require('../controllers/appointmentsController');
const { getWaitingPatients, updateAppointmentDoctor } = require('../controllers/appointmentsController');
const { getAppointmentSummary, getPatientSummary } = require('../controllers/appointmentsController');
const { getApprovedAppointments, getPendingAppointments } = require('../controllers/appointmentsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patient_id
 *         - date
 *         - time
 *       properties:
 *         id:
 *           type: integer
 *         patient_id:
 *           type: integer
 *         patient_name:
 *           type: string
 *         doctor_id:
 *           type: integer
 *         doctor_name:
 *           type: string
 *         # doctor_id is optional; endpoints may set it to null when not provided
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *           format: time
 *         status:
 *           type: string
 *           description: "Appointment status. Default: pending"
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of all appointments
 */
router.get('/', getAllAppointments);
router.get('/all', getAllAppointments);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get appointments for a specific doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments for the doctor
 */
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

/**
 * @swagger
 * /api/appointments/patient/{patientId}/summary:
 *   get:
 *     summary: Get patient summary (patient info + all appointments with doctor names)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient summary with all appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 * */
router.get('/patient/:patientId/summary', getPatientSummary);

/**
 * @swagger
 * /api/appointments/patient/{patientId}:
 *   get:
 *     summary: Get appointments for a specific patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments for the patient
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 * */
router.get('/patient/:patientId', getAppointmentsByPatient);

/**
 * @swagger
 * /api/appointments/approved:
 *   get:
 *     summary: Get approved appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of approved appointments
 */
router.get('/approved', getApprovedAppointments);

/**
 * @swagger
 * /api/appointments/pending:
 *   get:
 *     summary: Get pending appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of pending appointments
 */
router.get('/pending', getPendingAppointments);

/**
 * Get appointments waiting for assignment (no doctor assigned)
 */
/**
 * @swagger
 * /api/appointments/waiting:
 *   get:
 *     summary: Get appointments waiting for assignment (no doctor assigned)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of waiting appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Internal server error
 */
router.get('/waiting', getWaitingPatients);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/statistic:
 *   get:
 *     summary: Get appointment statistics for a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Counts by status and today's appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counts:
 *                   type: object
 *                 todayAppointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 * */
router.get('/doctor/:doctorId/statistic', require('../controllers/appointmentsController').getDoctorStatistics);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/summary:
 *   get:
 *     summary: Get appointment summaries for a specific doctor (appointment + patient + prescriptions + symptoms + medicals)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of appointment summaries for the doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appointment:
 *                     $ref: '#/components/schemas/Appointment'
 *                   prescriptions:
 *                     type: array
 *                     items:
 *                       type: object
 *                   symptoms:
 *                     type: array
 *                     items:
 *                       type: object
 *                   medicals:
 *                     type: array
 *                     items:
 *                       type: object
 */
router.get('/doctor/:doctorId/summary', require('../controllers/appointmentsController').getAppointmentSummaryByDoctor);

/**
 * @swagger
 * /api/appointments/{id}/summary:
 *   get:
 *     summary: Get appointment summary (appointment + patient + prescriptions + symptoms + medicals)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *                 prescriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 symptoms:
 *                   type: array
 *                   items:
 *                     type: object
 *                 medicals:
 *                   type: array
 *                   items:
 *                     type: object
 * */
router.get('/:id/summary', require('../controllers/appointmentsController').getAppointmentSummary);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 * */
router.get('/:id', getAppointmentById);
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/', createAppointment);
router.post('/t', createAppointmentNoDoctor);
/**
 * @swagger
 * /api/appointments/t:
 *   post:
 *     summary: Create a new appointment without specifying a doctor (doctor_id will be null)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - date
 *               - time
 *             properties:
 *               patient_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: Status value
 *                 enum: [pending, approved, rejected]
 *             example:
 *               status: approved
 *     responses:
 *       200:
 *         description: Updated appointment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Appointment not found
 * */
router.patch('/:id/status', updateAppointmentStatus);

/**
 * Assign a doctor to an appointment
 */
/**
 * @swagger
 * /api/appointments/{id}/doctor:
 *   patch:
 *     summary: Assign a doctor to an appointment (set doctor_id)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated appointment with assigned doctor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/doctor', updateAppointmentDoctor);

/**
 * @swagger
 * /api/appointments/{id}/approve:
 *   patch:
 *     summary: Approve an appointment (set status to 'approved')
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated appointment (approved)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Update appointment fields (status, summary, payment_status, etc.)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               summary:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated appointment
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id', require('../controllers/appointmentsController').updateAppointment);

router.patch('/:id/approve', require('../controllers/appointmentsController').approveAppointment);

module.exports = router;
