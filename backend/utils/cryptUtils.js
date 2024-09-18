const crypto = require('crypto');

// Use SHA-256 to derive a 32-byte key from the provided ENCRYPTION_KEY
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default-key').digest();
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        const textParts = text.split(':');
        // If the text doesn't have two parts separated by ':', it's not encrypted
        if (textParts.length !== 2) {
            return text; // Return the original text if it's not encrypted
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return text; // Return the original text if decryption fails
    }
}

function isEncrypted(text) {
    const textParts = text.split(':');
    return textParts.length === 2 && textParts[0].length === IV_LENGTH * 2; // IV is in hex, so its length is doubled
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.isEncrypted = isEncrypted;