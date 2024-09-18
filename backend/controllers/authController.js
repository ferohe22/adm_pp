const authService = require('../services/authService');
const logger = require('../utils/logger');

async function login(req, res) {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    if (!email || !password) {
        logger.warn('Login attempt with missing credentials', { email });
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        logger.info('Attempting to authenticate user', { email });
        const authResult = await authService.authenticateUser(email, password);
        logger.info('Authentication successful', { userId: authResult.user.id_tab_key, email: authResult.user.email });

        // Log the successful login to Airtable
        try {
            await logger.logToAirtable({
                userId: authResult.user.id_tab_key,
                email: authResult.user.email,
                action: 'Login',
                baseId: process.env.AIRTABLE_BASE_ID,
                tableName: process.env.AIRTABLE_TABLE_NAME
            });
            logger.info('Successfully logged to Airtable');
        } catch (logError) {
            logger.error('Failed to log successful login to Airtable', { 
                error: logError.message, 
                stack: logError.stack 
            });
        }

        res.status(200).json(authResult);
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            logger.warn('Failed login attempt', { email });
            res.status(401).json({ error: 'Invalid email or password' });
        } else {
            logger.error('Unexpected error during login', { 
                email, 
                error: error.message, 
                stack: error.stack 
            });
            res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
        }
    }
}

module.exports = { login };