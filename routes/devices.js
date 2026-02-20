const express = require('express');
const router = express.Router();
const { registerDeviceToPatient } = require('../controllers/devicesController');

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceRegistration:
 *       type: object
 *       required:
 *         - patient_id
 *         - device_serial_number
 *       properties:
 *         id:
 *           type: integer
 *         patient_id:
 *           type: integer
 *           example: 12
 *         device_serial_number:
 *           type: string
 *           example: DEV-AX12-0098
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/devices/register:
 *   post:
 *     summary: Register a device to a patient
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceRegistration'
 *     responses:
 *       201:
 *         description: Device registered to patient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceRegistration'
 */
router.post('/register', registerDeviceToPatient);

module.exports = router;
