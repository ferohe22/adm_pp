const crypto = require('crypto');

/**
 * Generate a random string of specified length
 * @param {number} length - The length of the random string
 * @returns {string} - A random string
 */
function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Format a date to a specified format
 * @param {Date} date - The date to format
 * @param {string} format - The format string (e.g., 'YYYY-MM-DD')
 * @returns {string} - The formatted date string
 */
function formatDate(date, format) {
    const map = {
        MM: date.getMonth() + 1,
        DD: date.getDate(),
        YYYY: date.getFullYear(),
        HH: date.getHours(),
        mm: date.getMinutes(),
        ss: date.getSeconds()
    };

    return format.replace(/MM|DD|YYYY|HH|mm|ss/gi, matched => map[matched].toString().padStart(2, '0'));
}

/**
 * Sanitize a string by removing or escaping potentially dangerous characters
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeString(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

module.exports = {
    generateRandomString,
    validateEmail,
    formatDate,
    sanitizeString
};