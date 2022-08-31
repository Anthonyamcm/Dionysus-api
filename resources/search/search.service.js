const assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
const dbHelper = require('../../Common/src/database/db.helper');
const User = require('../../Common/src/database/models/user.model');
const utilService = require('../../Common/src/utils');
const jwt = require('../../Common/src/security/jwt.service');
const sessionService = require('../session/session.service');
const { checkSessionStatus } = require('../../Common/src/middleware/auth.middleware');

module.exports = {
    async getAllUsers(req, value) {
        try {
        const { token, id } = value;
        let session_id = req.headers && req.headers['session-id'] ? req.headers['session-id'] : '';
		if (session_id) {
			await checkSessionStatus(req, session_id);
			session_id = req.headers && req.headers['session-id'] ? req.headers['session-id'] : '';
		}

            //check Session
			const session = await sessionService.getByTokenID(req, token, id);
            assert(session, utilService.errorService.showMessage("Session Expired"));

			// Check expire token.
			const validateToken = jwt.verify(session.token);
			assert(validateToken, utilService.errorService.showMessage("Invalid token"));

        
            const users = await User.aggregate([
                {
                    $project: {
                        "first_name": 1,
                        "last_name": 1,
                        "email": 1,
                        "is_friends": {
                            $in: [ObjectId(id), "$friends.user"],
                            $in : [3, "$friends.status"]
                        }
                    }
                }
			])

            return users;
        } catch (error) {
            throw error;
        }
    },
}