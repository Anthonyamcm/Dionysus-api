const errorService = require('./error.service');
const dataService = require('./data.service');
const validationService = require('./validation.service');

const utils = {};

utils.errorService = errorService;
utils.dataService = dataService;
utils.validationService = validationService;

module.exports = utils;