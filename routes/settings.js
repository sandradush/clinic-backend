const express = require('express');
const router = express.Router();
const { saveGeneralSettings } = require('../controllers/settingsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     GeneralSettings:
 *       type: object
 *       required:
 *         - clinicName
 *         - defaultLanguage
 *         - primaryAddress
 *       properties:
 *         clinicName:
 *           type: string
 *         defaultLanguage:
 *           type: string
 *           enum: [English, French, Kinyarwanda]
 *         primaryAddress:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/settings/general:
 *   put:
 *     summary: Save general clinic settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneralSettings'
 *     responses:
 *       200:
 *         description: General settings saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralSettings'
 *       400:
 *         description: Validation error
 */
router.put('/general', saveGeneralSettings);

module.exports = router;
