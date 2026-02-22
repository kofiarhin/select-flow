const crypto = require('crypto');

const generateClientToken = () => crypto.randomBytes(32).toString('hex');

module.exports = { generateClientToken };
