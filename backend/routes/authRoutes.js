const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLoginInput } = require('../middleware/validation');
const errorHandler = require('../middleware/errorHandler');
const logger = require('../utils/logger');

router.post('/authenticate', (req, res, next) => {
    logger.info('Authenticate route hit', { method: req.method, url: req.url });
    validateLoginInput(req, res, () => {
        logger.info('Login input validated');
        authController.login(req, res, next);
    });
});

router.post('/api/auth/Authenticate', (req, res, next) => {
    logger.info('Login route hit', { method: req.method, url: req.url });
    validateLoginInput(req, res, () => {
        logger.info('Login input validated');
        authController.login(req, res, next);
    });
});

router.use(errorHandler);

module.exports = router;