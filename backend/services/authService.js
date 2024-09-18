const Airtable = require('airtable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail } = require('./validators');
const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const { decrypt } = require('../utils/cryptUtils');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: decrypt(process.env.AIRTABLE_API_KEY)
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

async function authenticateUser(email, password) {
    try {
        logger.info('Attempting to authenticate user', { email });

        if (!validateEmail(email)) {
            logger.warn('Invalid email format', { email });
            throw new Error('Invalid email format');
        }

        if (!password || password.length < 8) {
            logger.warn('Invalid password length', { email });
            throw new Error('Password must be at least 8 characters long');
        }

        logger.info('Querying Airtable', { 
            baseId: process.env.AIRTABLE_BASE_ID,
            tableName: process.env.AIRTABLE_TABLE_NAME,
            email 
        });

        const records = await base(process.env.AIRTABLE_TABLE_NAME).select({
            filterByFormula: `LOWER({Email}) = LOWER('${email}')`
        }).firstPage();

        logger.info('Airtable query completed', { recordsFound: records.length });

        if (records.length === 0) {
            logger.warn('User not found', { email });
            throw new Error('User not found');
        }

        const user = records[0].fields;

        if (!user.password) {
            logger.warn('Password not set for user', { email });
            throw new Error('Password not set for user');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Incorrect password', { email });
            throw new Error('Incorrect password');
        }

        logger.info('User authenticated successfully', { email });

        const token = jwt.sign(
            { id: records[0].id, email: user.Email },
            decrypt(process.env.JWT_SECRET),
            { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: records[0].id,
                email: user.Email
            }
        };
    } catch (error) {
        logger.error('Authentication error:', { error: error.message, stack: error.stack });
        throw error; // Propagate the original error
    }
}

module.exports = { authenticateUser, limiter };
