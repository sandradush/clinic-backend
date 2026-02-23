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
 *     VitalReading:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         deviceId:
 *           type: string
 *         patientId:
 *           type: integer
 *         readingType:
 *           type: string
 *         value:
 *           type: number
 *         unit:
 *           type: string
 *         timestamp:
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
 *         description: ID of the patient
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           maximum: 100
 *           minimum: 1
 *         description: Number of latest readings to return (defaults to 1 - most recent)
 *     responses:
 *       '200':
 *         description: Successful response - returns the latest vitals readings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VitalReading'
 *       '400':
 *         description: Invalid parameters
 *       '404':
 *         description: Patient not found
 *       '500':
 *         description: Server error
 */
router.get('/patient/:patientId/readings', getPatientDeviceReadings);

module.exports = router;