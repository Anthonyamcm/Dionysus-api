const assert = require('assert');
const moment = require('moment');


const Session = require('../../Common/src/database/models/session-login.model');
const dbHelper = require('../../Common/src/database/db.helper');
const utilService = require('../../Common/src/utils');

module.exports = {
	async getByTokenID(req, tokenId, id) {
		try {
			const sessionInfo = await Session.findOne({
                user: id.toString(),
                token: tokenId
            })
			assert(sessionInfo, utilService.errorService.showMessage({ Text: "Invalid Token"}));

			return sessionInfo;
		} catch (error) {
			throw error;
		}
	},
}