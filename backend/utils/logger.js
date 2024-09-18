const path = require('path');
const winston = require('winston');
const Airtable = require('airtable');

// Initialize Airtable
Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Create a Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, 'combined.log') }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    ],
});

// Function to log to Airtable
async function logToAirtable(data) {
    const { userId, email, action, baseId, tableName } = data;
    logger.info('Attempting to log to Airtable', { userId, email, action, baseId, tableName });

    try {
        if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME_LOG) {
            throw new Error('Missing Airtable configuration');
        }

        const record = await base(process.env.AIRTABLE_TABLE_NAME_LOG).create({
            "User ID": userId,
            "Email": email,
            "Action": action,
            "Base ID": baseId || process.env.AIRTABLE_BASE_ID,
            "Table Name": tableName || process.env.AIRTABLE_TABLE_NAME,
            "Timestamp": new Date().toISOString()
        });
        logger.info('Log saved successfully to Airtable', { recordId: record.id });
    } catch (error) {
        logger.error('Error saving log to Airtable', { 
            error: error.message, 
            stack: error.stack,
            airtableError: error.error,
            statusCode: error.statusCode
        });
        throw error;
    }
}

module.exports = {
    info: (message, meta) => logger.info(message, meta),
    warn: (message, meta) => logger.warn(message, meta),
    error: (message, meta) => logger.error(message, meta),
    debug: (message, meta) => logger.debug(message, meta),
    logToAirtable
};