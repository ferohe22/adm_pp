// Validation middleware functions

const validatePdfUpload = (req, res, next) => {
    // Add PDF upload validation logic here
    // For example, check if files are present and are PDF format
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    // Add more specific validation as needed
    next();
};

const validateJsonUpload = (req, res, next) => {
    // Add JSON upload validation logic here
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Add more specific validation as needed
    next();
};

const validateTxtUpload = (req, res, next) => {
    // Add TXT upload validation logic here
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    // Add more specific validation as needed
    next();
};

const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    // Add more specific validation as needed
    next();
};

module.exports = {
    validatePdfUpload,
    validateJsonUpload,
    validateTxtUpload,
    validateLoginInput
};