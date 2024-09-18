const crypto = require('crypto');

function generatePassword(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

console.log(generatePassword());