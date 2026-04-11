const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a message between a doctor and a patient
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender_id
 *               - receiver_id
 *               - content
 *             properties:
 *               sender_id:
 *                 type: integer
 *               receiver_id:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 sender:
 *                   type: integer
 *                 receiver:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/send', sendMessage);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Get chat history between a patient and a doctor
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   sender:
 *                     type: integer
 *                   receiver:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/history', getChatHistory);

module.exports = router;
