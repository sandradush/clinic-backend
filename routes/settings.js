const express = require('express');
const router = express.Router();
const { getGeneralSettings, upsertGeneralSettings } = require('../controllers/settingsController');

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
 *   get:
 *     summary: Get general clinic settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: General settings
 *         content:
 *           application/json:
 *             example:
 *               clinicName: string
 *               defaultLanguage: English
 *               primaryAddress: string
 *               created_at: 2026-02-23T07:00:18.244Z
 *               updated_at: 2026-02-23T07:00:18.244Z
 *             schema:
 *               $ref: '#/components/schemas/GeneralSettings'
 */
router.get('/general', getGeneralSettings);

/**
 * @swagger
 * /api/settings/general:
 *   put:
 *     summary: Create or update general clinic settings
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
router.put('/general', upsertGeneralSettings);

module.exports = router;
