const express = require('express');
const router = express.Router();
const { createPaymentIntent, getAllPayments } = require('../controllers/paymentsController');

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments (admin)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of all payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   status:
 *                     type: string
 *                   patient_id:
 *                     type: string
 *                   appointment_id:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/', getAllPayments);

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - patient_id
 *               - appointment_id
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in dollars (e.g. 50 for $50)
 *               currency:
 *                 type: string
 *                 default: usd
 *               patient_id:
 *                 type: integer
 *               appointment_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentIntent:
 *                   type: string
 *                   description: Stripe client secret
 *                 publishableKey:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Stripe error
 */
router.post('/create-payment-intent', createPaymentIntent);
router.post('/initiate', createPaymentIntent);

module.exports = router;
