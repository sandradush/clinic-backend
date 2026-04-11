const express = require('express');
const router = express.Router();
const { initiateCall } = require('../controllers/callsController');

/**
 * @swagger
 * /api/calls/initiate:
 *   post:
 *     summary: Initiate a video call and get a room_id
 *     tags: [Calls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caller_id
 *               - receiver_id
 *             properties:
 *               caller_id:
 *                 type: integer
 *               receiver_id:
 *                 type: integer
 *               appointment_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Room ID for the call
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room_id:
 *                   type: string
 */
router.post('/initiate', initiateCall);

module.exports = router;
