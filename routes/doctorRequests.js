const express = require('express');
const router = express.Router();
const { getDoctorRequests, updateDoctorRequest } = require('../controllers/doctorsController');

/**
 * @swagger
 * /api/doctor-requests:
 *   get:
 *     summary: Get all pending doctor registration requests
 *     tags: [Doctor Requests]
 *     responses:
 *       200:
 *         description: List of pending doctor requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   specialty:
 *                     type: string
 *                   licenseNumber:
 *                     type: string
 *                   requestDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                   documents:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get('/', getDoctorRequests);

/**
 * @swagger
 * /api/doctor-requests/{requestId}:
 *   put:
 *     summary: Approve or reject a doctor request
 *     tags: [Doctor Requests]
 *     parameters:
 *       - in: path
 *         name: requestId
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
 *                 enum: [approved, rejected]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor request updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Doctor request not found
 */
router.put('/:requestId', updateDoctorRequest);

module.exports = router;
