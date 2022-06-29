const constantService = require('./constant.service');
const validatorConstantService = require('./validator.constant.service');
const strings = require('./localization.service');

const constants = {};

constants.constantService = constantService;
constants.validatorConstantService = validatorConstantService;
constants.strings = strings;

module.exports = constants;
