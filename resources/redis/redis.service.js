const assert = require('assert');
const moment = require('moment');


const Redis = require('../../Common/src/database/models/redis.model');
const dbHelper = require('../../Common/src/database/db.helper');
const utilService = require('../../Common/src/utils');
const redisValidation = require('./redis.validation');

module.exports = {
	async saveRedis(req, body) {
		try {
			const { value, error } = redisValidation.validateSaveRedis(body);
			assert(!error, error);

			const redisInfo = await dbHelper.save(Redis, { data: value, middleware: req.middleware });
			assert(redisInfo, "constantService.SESSION.SAVE_SESSION_ERROR");

			return { result: redisInfo };
		} catch (error) {
			throw error;
		}
	},

	async getByTokenID(req, tokenId) {
		try {
			const redisInfo = await dbHelper.fetchOne(Redis, {
				query: {
					token_id: tokenId,
					is_active: true,
				},
				middleware: req.middleware,
			});
			assert(redisInfo, utilService.errorService.showMessage({ Text: "Invalid Token"}));

			return redisInfo;
		} catch (error) {
			throw error;
		}
	},
}