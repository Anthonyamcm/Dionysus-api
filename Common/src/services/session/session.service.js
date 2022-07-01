const assert = require('assert');
require('../../database/models/user.model');
const { strings } = require('../../constant');
const SessionLogin = require('../../database/models/session-login.model');
const utilService = require('../../utils');
const { dbHelper } = require('../../database');

module.exports = {
	async getSession(req, token = '') {
		try {
			const session_id = req.headers && req.headers['session-id'] ? req.headers['session-id'] : '';

			const sessionQuery = {
				session_id,
				is_active: true,
			};
			if (token) {
				sessionQuery.token = token;
			}
			const sessionLogin = await dbHelper.fetchOne(SessionLogin, {
				query: sessionQuery,
				populate: {
					path: 'user',
				},
				middleware: req.middleware,
			});

			return sessionLogin;
		} catch (error) {
			throw error;
		}
	},

	async validateAndAssignAuthorisedUsed(req, token = '') {
		try {
			const session = await this.getSession(req, token);
			assert(session, utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE));
			const { user } = session;
			assert(user, utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE));
			await this.assignAuthorisedUser(req, session);
		} catch (error) {
			throw error;
		}
	},

	async assignAuthorisedUser(req) {
		try {
			const session = await this.getSession(req);
			if (session && !req.authorisedUser) {
				const { user } = session;
				req.userRole = user.role[0].slug;
				req.authorisedUser = user;
			}
		} catch (error) {
			throw error;
		}
	},
};
