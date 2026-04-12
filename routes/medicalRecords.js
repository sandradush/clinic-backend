const express = require('express');
const router = express.Router();
const { getAllRecords, createRecord, getRecordById, updateRecord, deleteRecord } = require('../controllers/medicalRecordsController');

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
 *               - file_url
 *             properties:
 *               consultation_id:
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
 * /api/medical-records/{record_id}:
 *   get:
 *     summary: Get a single medical record by record_id
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Medical record found
 *       404:
 *         description: Medical record not found
 */
router.get('/:record_id', getRecordById);

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
