const express = require('express');
const router = express.Router();
const { createMedical, getMedicalsByAppointment } = require('../controllers/medicalsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medical:
 *       type: object
 *       required:
 *         - appointment_id
 *         - medical_name
 *       properties:
 *         id:
 *           type: integer
 *         appointment_id:
 *           type: integer
 *         medical_name:
 *           type: string
 *         dosage:
 *           type: string
 *         frequency:
 *           type: string
 *         note:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/medicals:
 *   post:
 *     summary: Create a new medical for an appointment
 *     tags: [Medicals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medical'
 *     responses:
 *       201:
 *         description: Medical created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medical'
 */
router.post('/', createMedical);

/**
 * @swagger
 * /api/medicals/appointment/{appointmentId}:
 *   get:
 *     summary: List medicals for an appointment
 *     tags: [Medicals]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of medicals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medical'
 */
router.get('/appointment/:appointmentId', getMedicalsByAppointment);

// GET /api/medicals/{id} removed per request

module.exports = router;
