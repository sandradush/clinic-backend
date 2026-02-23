const express = require('express');
const router = express.Router();
const { saveGeneralSettings, resetGeneralSettings } = require('../controllers/settingsController');

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
 *       400:
 *         description: Validation error
 */
router.put('/general', saveGeneralSettings);

/**
 * @swagger
 * /api/settings/general/reset:
 *   post:
 *     summary: Reset general clinic settings to defaults
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: General settings reset
 */
router.post('/general/reset', resetGeneralSettings);

module.exports = router;
