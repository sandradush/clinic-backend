const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionsByAppointment } = require('../controllers/prescriptionsController');

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
router.get('/appointment/:appointmentId', getPrescriptionsByAppointment);

module.exports = router;
