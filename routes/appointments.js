const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  getDoctorStatistics
} = require('../controllers/appointmentsController');
const { getAppointmentSummary } = require('../controllers/appointmentsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patient_id
 *         - doctor_id
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
 */
router.get('/doctor/:doctorId/statistic', require('../controllers/appointmentsController').getDoctorStatistics);

/**
 * @swagger
 * /api/appointments/{id}/summary:
 *   get:
 *     summary: Get appointment summary (appointment + patient + perceptions + symptoms + medicals)
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
 *                 perceptions:
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
 */
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
 */
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
 *             properties:
 *               status:
 *                 type: string
 *                 description: Status value (pending, approved, rejected)
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
 */
router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;
