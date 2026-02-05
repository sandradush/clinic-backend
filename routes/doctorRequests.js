const express = require('express');
const router = express.Router();
const {
  createDoctorRequest,
  getAllDoctorRequests,
  approveDoctorRequest,
  rejectDoctorRequest
} = require('../controllers/doctorRequestController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     DoctorRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - specialty
 *         - licenseNumber
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         name:
 *           type: string
 *         specialty:
 *           type: string
 *         licenseNumber:
 *           type: string
 *         phone:
 *           type: string
 */

/**
 * @swagger
 * /api/doctor-requests:
 *   post:
 *     summary: Create doctor request
 *     tags: [Doctor Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorRequest'
 *     responses:
 *       201:
 *         description: Doctor request submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createDoctorRequest);

/**
 * @swagger
 * /api/doctor-requests:
 *   get:
 *     summary: Get all doctor requests (Admin only)
 *     tags: [Doctor Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctor requests
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticateToken, requireAdmin, getAllDoctorRequests);

/**
 * @swagger
 * /api/doctor-requests/{id}/approve:
 *   put:
 *     summary: Approve doctor request
 *     tags: [Doctor Requests]
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
 *         description: Doctor request approved successfully
 *       404:
 *         description: Request not found
 */
router.put('/:id/approve', authenticateToken, requireAdmin, approveDoctorRequest);

/**
 * @swagger
 * /api/doctor-requests/{id}/reject:
 *   put:
 *     summary: Reject doctor request
 *     tags: [Doctor Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor request rejected successfully
 *       404:
 *         description: Request not found
 */
router.put('/:id/reject', authenticateToken, requireAdmin, rejectDoctorRequest);

module.exports = router;