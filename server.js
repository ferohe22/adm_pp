require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileRoutes = require('./backend/routes/fileRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const logger = require('./backend/utils/logger');
const { encrypt, isEncrypted } = require('./backend/utils/cryptUtils');
const app = express();

logger.info('Starting server...');

const sessionConfig = {
    store: new FileStore({
        path: './sessions',
        encrypt: true,
        secret: process.env.SESSION_SECRET || 'default_fallback_secret',
        reapInterval: 60 * 60, // Limpiar sesiones expiradas cada hora
        ttl: 24 * 60 * 60 // Tiempo de vida de 24 horas
    }),
    secret: process.env.SESSION_SECRET || 'default_fallback_secret',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renueva la sesión con cada petición
    cookie: { 
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,  // 24 horas
        sameSite: 'strict'
    }
};

if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate required environment variables
const requiredEnvVars = [
    'FTP_HOST', 'FTP_USER', 'FTP_PASS', 'REMOTE_DIRECTORY',
    'URL_PREFIX', 'MAX_TOKENS', 'JINA_API_KEY',
    'AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME',
    'AIRTABLE_TABLE_NAME_LOG', 'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Check if ENCRYPTION_KEY is set
if (!process.env.ENCRYPTION_KEY) {
    logger.warn('ENCRYPTION_KEY is not set. Using default key for encryption. This is not recommended for production.');
}

// Encrypt sensitive environment variables if they're not already encrypted
['FTP_PASS', 'JINA_API_KEY', 'AIRTABLE_API_KEY', 'JWT_SECRET'].forEach(key => {
    if (!isEncrypted(process.env[key])) {
        process.env[key] = encrypt(process.env[key]);
    }
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
    });
    next();
});

// API routes
app.use('/api', fileRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res, next) => {
    logger.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Server error:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

module.exports = { server };
