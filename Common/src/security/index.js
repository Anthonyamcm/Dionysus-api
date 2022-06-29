const jwtService = require('./jwt.service');
const passwordService = require('./password.service');
const e2eService = require('./e2e.service');
const keysService = require('./keys.service');

const security = {};

security.jwtService = jwtService;
security.passwordService = passwordService;
security.e2eService = e2eService;
security.keysService = keysService;


module.exports = security;