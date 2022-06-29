const dbHelper = require('./db.helper');
const { initializeDatabase, gracefulExit } = require('./db.service');

const instance = {};

instance.initializeDatabase = initializeDatabase;
instance.gracefulExit = gracefulExit;
instance.dbHelper = dbHelper;

module.exports = instance;