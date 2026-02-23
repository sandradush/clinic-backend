const express = require('express');
const router = express.Router();
const { registerDeviceToPatient, getPatientDeviceReadings } = require('../controllers/devicesController');

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

/**
 * @swagger
 * /api/devices/patient/{patientId}/readings:
 *   get:
 *     summary: Retrieve vitals captured by devices registered to a patient
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 200
 *     responses:
 *       200:
 *         description: Device readings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   patient_id:
 *                     type: integer
 *                   device_serial_number:
 *                     type: string
 *                   vital_id:
 *                     type: integer
 *                   heart_rate_bpm:
 *                     type: number
 *                   spo2:
 *                     type: number
 *                   temperature:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/patient/:patientId/readings', getPatientDeviceReadings);

module.exports = router;
