// Validation utility functions

const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    // Password must be at least 8 characters long and contain at least one number, one uppercase and one lowercase letter
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
};

const validateUsername = (username) => {
    // Username must be between 3 and 20 characters long and can only contain alphanumeric characters and underscores
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername
};