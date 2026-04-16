const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionsByAppointment, getPrescriptionsByPatient } = require('../controllers/prescriptionsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       required:
 *         - appointment_id
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *         appointment_id:
 *           type: integer
 *         title:
 *           type: string
 *         note:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new prescription for an appointment
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: Prescription created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 */
router.post('/', createPrescription);

/**
 * @swagger
 * /api/prescriptions/appointment/{appointmentId}:
 *   get:
 *     summary: List prescriptions for an appointment
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get all prescriptions for a patient
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of patient prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/patient/:patientId', require('../controllers/prescriptionsController').getPrescriptionsByPatient);

router.get('/appointment/:appointmentId', getPrescriptionsByAppointment);
router.get('/:appointmentId', getPrescriptionsByAppointment);

module.exports = router;
