const express = require('express');
const router = express.Router();
const { createPerception, getPerceptionsByAppointment } = require('../controllers/perceptionsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Perception:
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
 * /api/perceptions:
 *   post:
 *     summary: Create a new perception for an appointment
 *     tags: [Perceptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Perception'
 *     responses:
 *       201:
 *         description: Perception created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perception'
 */
router.post('/', createPerception);

/**
 * @swagger
 * /api/perceptions/appointment/{appointmentId}:
 *   get:
 *     summary: List perceptions for an appointment
 *     tags: [Perceptions]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of perceptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Perception'
 */
router.get('/appointment/:appointmentId', getPerceptionsByAppointment);

module.exports = router;
