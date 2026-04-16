const express = require('express');
const router = express.Router();
const { getAllRecords, createRecord, getPatientRecords, updateRecord, deleteRecord } = require('../controllers/medicalRecordsController');

/**
 * @swagger
 * /api/medical-records:
 *   get:
 *     summary: Get all medical records
 *     tags: [Medical Records]
 *     responses:
 *       200:
 *         description: List of medical records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   record_id:
 *                     type: integer
 *                   consultation_id:
 *                     type: integer
 *                   patient_id:
 *                     type: integer
 *                   patient_name:
 *                     type: string
 *                   file_url:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/', getAllRecords);

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultation_id
 *               - patient_id
 *               - file_url
 *             properties:
 *               consultation_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               file_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medical record created
 */
router.post('/', createRecord);

/**
 * @swagger
 * /api/medical-records/patient/{user_id}:
 *   get:
 *     summary: Get all medical records for a patient (written by doctor)
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of patient medical records with doctor and appointment info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   record_id:
 *                     type: integer
 *                   consultation_id:
 *                     type: integer
 *                   patient_id:
 *                     type: integer
 *                   file_url:
 *                     type: string
 *                   description:
 *                     type: string
 *                   appointment_date:
 *                     type: string
 *                     format: date
 *                   appointment_time:
 *                     type: string
 *                   patient_name:
 *                     type: string
 *                   doctor_id:
 *                     type: integer
 *                   doctor_name:
 *                     type: string
 */
router.get('/patient/:user_id', getPatientRecords);

/**
 * @swagger
 * /api/medical-records/{record_id}:
 *   put:
 *     summary: Update a medical record
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: record_id
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
 *               consultation_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               file_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medical record updated
 *       404:
 *         description: Medical record not found
 */
router.put('/:record_id', updateRecord);

/**
 * @swagger
 * /api/medical-records/{record_id}:
 *   delete:
 *     summary: Delete a medical record
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medical record deleted
 *       404:
 *         description: Medical record not found
 */
router.delete('/:record_id', deleteRecord);

module.exports = router;
