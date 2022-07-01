const assert = require('assert');
const _ = require('lodash');
const util = require('util');
const { constantService } = require('../constant');
const response = require('../response/response.service');
const { jwtService } = require('../security/index');
const strings = require('../constant');
const User = require('../database/models/user.model');
const status = require('../response/status.code');
const sessionService = require('../services/session/session.service');
const utilService = require('../utils');
const { dbHelper } = require('../database');
const analyticsService = require('../services/analytics/analytics.service');

const { DB_TYPE } = process.env;


const checkApplicationAuth = async (req, application_id) => {
	try {
		const application = await dbHelper.fetchOne(Application, {
			query: {
				_id: application_id,
				is_active: true,
			},
			middleware: req.middleware,
		});
		assert(application, utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE));

		req.middleware = { application };
		setDefaultLanguage(application);
	} catch (error) {
		throw error;
	}
};

module.exports = {
	async sessionAuth(req, res, next) {
		try {
			await sessionService.validateAndAssignAuthorisedUsed(req);
			next();
		} catch (error) {
			response.exception(res, error, status.unauthorized.code);
		}
	},

	async checkSessionStatus(req, session_id) {
		try {
			if (!session_id || _.isEmpty(session_id)) {
				if (
					req.originalUrl.includes('/register') ||
					req.originalUrl.includes('/forget/password') ||
					req.originalUrl.includes('/sign')
				) {
					req.headers['session-id'] = '';
				} else {
					assert(false, strings.VALIDATION_ERROR.SESSION_NOT_FOUND);
				}
			} else {
				await sessionService.assignAuthorisedUser(req);
			}
		} catch (error) {
			throw error;
		}
	},

	async auth(req, res, next) {
		try {
			const application_id = req.headers && req.headers['application-id'] ? req.headers['application-id'] : '';
			const route = req.originalUrl;
			const routeCheck = route === '/' || route === '/wsdl' || route.includes('/wsdl') || route.includes('/webhook/pushAuthorizationData') || route === '/nab';

			if (routeCheck) {
				next();
			} else {
				const auth = req.headers['api-key'];
				assert(auth, 'Unauthorized access');
				assert(auth === process.env.API_KEY, 'Unauthorized access');

				if (!req.authorisedUser) {
					await sessionService.assignAuthorisedUser(req);
				}

				if (DB_TYPE !== 'oracle') {
					if (application_id) {
						await checkApplicationAuth(req, application_id);
					} else {
						assert(false, utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE));
					}
				}

				next();
			}
		} catch (error) {
			response.exception(res, error, status.unauthorized.code);
		}
	},

	async authUser(req, res, next) {
		try {
			const application_id = req.headers && req.headers['application-id'] ? req.headers['application-id'] : '';
			const route = req.originalUrl;
			const { path } = req.headers;
			const routeCheck = route === '/';
			const pathCheck = (path && path.includes('/ehi')) || (path && path.includes('/register')) || (path && path.includes('/nab'));

			if (routeCheck) {
				next();
			} else if (pathCheck) {
				await checkApplicationAuth(req, application_id);
				next();
			} else {
				await sessionService.validateAndAssignAuthorisedUsed(req);
				await checkApplicationAuth(req, application_id);
				next();
			}
		} catch (error) {
			response.exception(res, error, status.unauthorized.code);
		}
	},

	async apiAuth(req, res, next) {
		try {
			const { authorization } = req.headers;
			assert(authorization, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			const token = authorization.split(' ')[1];
			const verified = jwtService.verify(token);
			assert(verified, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			await sessionService.validateAndAssignAuthorisedUsed(req, token);

			next();
		} catch (e) {
			response.exception(res, e, status.unauthorized.code);
		}
	},

	async apiAccess(req, res, next) {
		try {
			const apiAccess = req.headers['api-access'];
			if (apiAccess) {
				const application = await dbHelper.fetchOne(Application, {
					query: {
						api_access: apiAccess,
						is_active: true,
					},
				});
				assert(application, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

				req.middleware = { application };
			} else {
				console.log('Fake Multi - Agri');
				const application = await dbHelper.fetchOne(Application, {
					query: {
						iss: 'agri',
						is_active: true,
					},
				});
				assert(application, utilService.errorService.showMessage(strings.VALIDATION_ERROR.APPLICATION_NOT_FOUND));

				req.middleware = { application };
			}

			await analyticsService.save(req, 'API');

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async apiSecret(req, res, next) {
		try {
			const { apiSecret, ...value } = req.body;
			req.body = value;
			assert(apiSecret, utilService.errorService.showMessage(strings.VALIDATION_ERROR.API_SECRET_KEY_NOT_FOUND));

			const application = await dbHelper.fetchOne(Application, {
				query: {
					secret_access_key: apiSecret,
					is_active: true,
				},
			});
			assert(application, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			req.middleware = { application };
			setDefaultLanguage(application);
			next();
		} catch (e) {
			response.exception(res, e);
		}
	},
};
