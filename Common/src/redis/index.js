const { initializeRedis } = require('./redis.service');

const instance = {};

instance.initializeRedis = initializeRedis;

module.exports = instance;