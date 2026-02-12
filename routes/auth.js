const express = require('express');
const multer = require('multer');
const router = express.Router();
const { register, login, getDoctors, getPatients, createDoctor, updateDoctorStatus } = require('../controllers/authController');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User self-registration
 *     tags: [Auth]
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
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Role will default to 'user' if not provided
 *                 enum: [admin, doctor, user]
 *               status:
 *                 type: string
 *                 description: User status will default to 'pending'
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Validation error
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login (Patient/Doctor/User)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/doctors:
 *   get:
 *     summary: Get list of doctors (id and name)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Array of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get('/doctors', getDoctors);

/**
 * @swagger
 * /api/auth/patients:
 *   get:
 *     summary: Get list of patients (id and name)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Array of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get('/patients', getPatients);

/**
 * @swagger
 * /api/auth/doctors:
 *   post:
 *     summary: Create doctor profile with license file upload
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - phone
 *               - speciality
 *               - national_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               phone:
 *                 type: string
 *               speciality:
 *                 type: string
 *               national_id:
 *                 type: string
 *               licence_file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file for doctor's license (optional)
 *     responses:
 *       201:
 *         description: Doctor profile created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     phone:
 *                       type: string
 *                     speciality:
 *                       type: string
 *                     licence_file_path:
 *                       type: string
 *                     national_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       500:
 *         description: File upload or server error
 */
router.post('/doctors', upload.single('licence_file'), createDoctor);

/**
 * @swagger
 * /api/auth/doctors/{id}/status:
 *   patch:
 *     summary: Update doctor status by doctor id
 *     tags: [Auth]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: One of pending, approved, rejected
 *     responses:
 *       200:
 *         description: Doctor status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       404:
 *         description: Doctor not found
 */
router.patch('/doctors/:id/status', updateDoctorStatus);

module.exports = router;