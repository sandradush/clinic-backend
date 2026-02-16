const express = require('express');
const router = express.Router();
const {
  getWaitingPatients,
  updateAppointmentDoctor
} = require('../controllers/appointmentsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
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
 *         status:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
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
/**
 * GET /api/appointments/waiting
 * Returns appointments where doctor_id IS NULL (waiting patients)
 */
router.get('/waiting', getWaitingPatients);

/**
 * PATCH /api/appointments/:id/doctor
 * Body: { doctor_id: <integer> }
 * Assigns a doctor to an appointment by updating `doctor_id`.
 */
/**
 * @swagger
 * /api/appointments/{id}/doctor:
 *   patch:
 *     summary: Assign a doctor to an appointment
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

module.exports = router;
