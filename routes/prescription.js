const express = require('express');
const router = express.Router();
const {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       required:
 *         - name
 *         - dosage
 *         - frequency
 *       properties:
 *         name:
 *           type: string
 *           description: Medication name
 *         dosage:
 *           type: string
 *           description: Dosage amount (e.g., 500mg)
 *         frequency:
 *           type: string
 *           description: How often to take (e.g., Three times daily)
 *         duration:
 *           type: string
 *           description: Duration of treatment (e.g., 7 days)
 *     Prescription:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - medications
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated prescription ID
 *         patientId:
 *           type: integer
 *           description: Patient ID
 *         doctorId:
 *           type: integer
 *           description: Doctor ID
 *         appointmentId:
 *           type: integer
 *           description: Related appointment ID
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 *         instructions:
 *           type: string
 *           description: Additional instructions
 *         date:
 *           type: string
 *           format: date
 *           description: Prescription date
 */

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management endpoints
 */

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get all prescriptions
 *     tags: [Prescriptions]
 *     responses:
 *       200:
 *         description: List of all prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/', getAllPrescriptions);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', getPrescriptionById);

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get all prescriptions for a specific patient
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
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
router.get('/patient/:patientId', getPrescriptionsByPatient);

/**
 * @swagger
 * /api/prescriptions/doctor/{doctorId}:
 *   get:
 *     summary: Get all prescriptions by a specific doctor
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of doctor's prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/doctor/:doctorId', getPrescriptionsByDoctor);

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - medications
 *             properties:
 *               patientId:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               appointmentId:
 *                 type: integer
 *               medications:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Medication'
 *               instructions:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Missing required fields
 */
router.post('/', createPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: Prescription not found
 */
router.put('/:id', updatePrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Delete prescription
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       204:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 */
router.delete('/:id', deletePrescription);

module.exports = router;
