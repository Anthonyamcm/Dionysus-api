const redis = require('async-redis');

/**
 * Creates the connection to redis.
 * @returns The connection to redis.
 */
const initializeRedis = () => {
	return new Promise((resolve, reject) => {
		if (!global.redis) {
			try {
				
				const redisClient = redis.createClient();
				console.log('****************** starting Redis ******************');

				redisClient.on('connect', () => {
					console.log('Redis connected successfully');
				});
				global.redis = redisClient;

				redisClient.on('error', (error) => {
					console.log('error', error);
				});
			} catch (error) {
				reject(error);
			}
		} else {
			resolve(global.redis);
		}
	});
};

module.exports = {
	initializeRedis,
};