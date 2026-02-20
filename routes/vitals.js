const express = require('express');
const router = express.Router();
const { createVital } = require('../controllers/vitalsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Vital:
 *       type: object
 *       required:
 *         - heart_rate_bpm
 *         - spo2
 *         - serial_number
 *         - temperature
 *       properties:
 *         id:
 *           type: integer
 *         heart_rate_bpm:
 *           type: number
 *           example: 78
 *         spo2:
 *           type: number
 *           example: 97
 *         serial_number:
 *           type: string
 *           example: DEV-AX12-0098
 *         temperature:
 *           type: number
 *           example: 36.7
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/vitals:
 *   post:
 *     summary: Receive and store device vitals
 *     tags: [Vitals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vital'
 *     responses:
 *       201:
 *         description: Vitals saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vital'
 */
router.post('/', createVital);

module.exports = router;
