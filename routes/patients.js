const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  getMyProfile,
  createPatient,
  updatePatient,
  updateMyProfile,
  deletePatient
} = require('../controllers/patientsController');
const { authenticateToken, requireAdmin, requireDoctor, requirePatient } = require('../middleware/auth');

/**
 * @swagger
 * /api/patients/me:
 *   get:
 *     summary: Get own profile (Patient access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile
 *       404:
 *         description: Profile not found
 */
router.get('/me', authenticateToken, requirePatient, getMyProfile);

/**
 * @swagger
 * /api/patients/me:
 *   put:
 *     summary: Update own profile (Patient access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', authenticateToken, requirePatient, updateMyProfile);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients (Admin/Doctor access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all patients
 */
router.get('/', authenticateToken, requireDoctor, getAllPatients);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create patient manually (Admin access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 */
router.post('/', authenticateToken, requireAdmin, createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get specific patient (Admin/Doctor access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient details
 *       404:
 *         description: Patient not found
 */
router.get('/:id', authenticateToken, requireDoctor, getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient (Admin access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put('/:id', authenticateToken, requireAdmin, updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Archive patient (Admin access)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient archived successfully
 */
router.delete('/:id', authenticateToken, requireAdmin, deletePatient);

module.exports = router;