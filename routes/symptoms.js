const express = require('express');
const router = express.Router();
const {
  createSymptom,
  getSymptomsByAppointment,
  getAppointmentsWithSymptomsTodayByDoctor
} = require('../controllers/symptomsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Symptom:
 *       type: object
 *       required:
 *         - appointment_id
 *         - symptom_name
 *       properties:
 *         id:
 *           type: integer
 *         appointment_id:
 *           type: integer
 *         symptom_name:
 *           type: string
 *         value:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/symptoms:
 *   post:
 *     summary: Create a new symptom for an appointment
 *     tags: [Symptoms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Symptom'
 *     responses:
 *       201:
 *         description: Symptom created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Symptom'
 */
router.post('/', createSymptom);

/**
 * @swagger
 * /api/symptoms/appointment/{appointmentId}:
 *   get:
 *     summary: List symptoms for an appointment
 *     tags: [Symptoms]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of symptoms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Symptom'
 */
router.get('/appointment/:appointmentId', getSymptomsByAppointment);


/**
 * @swagger
 * /api/symptoms/doctor/{doctorId}/appointments/today:
 *   get:
 *     summary: Get appointments that have symptoms recorded today for a doctor
 *     tags: [Symptoms]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments with symptoms recorded today for the doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/doctor/:doctorId/appointments/today', getAppointmentsWithSymptomsTodayByDoctor);

// symptom by id endpoint removed per request

module.exports = router;
