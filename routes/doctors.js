const express = require('express');
const router = express.Router();
const { getDoctors, updateAvailability } = require('../controllers/doctorsController');

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all approved doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of approved doctors
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
 *                   specialty:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   availability:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/', getDoctors);

/**
 * @swagger
 * /api/doctors/{doctorId}/availability:
 *   put:
 *     summary: Update a doctor's availability
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: doctorId
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
 *               - availability
 *             properties:
 *               availability:
 *                 type: string
 *                 enum: [online, offline, busy]
 *     responses:
 *       200:
 *         description: Availability updated
 *       404:
 *         description: Doctor not found
 */
router.put('/:doctorId/availability', updateAvailability);

module.exports = router;
