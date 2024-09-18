const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');
const { validateJsonInput } = require('../middleware/validation');
const errorHandler = require('../middleware/errorHandler');

router.post('/json-to-excel', validateJsonInput, conversionController.convertJsonToExcel);

router.use(errorHandler);

module.exports = router;