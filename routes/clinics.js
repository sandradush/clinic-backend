const express = require('express');
const router = express.Router();
const clinicsController = require('../controllers/clinicsController');

// Create a new clinic
router.post('/', clinicsController.createClinic);

module.exports = router;
