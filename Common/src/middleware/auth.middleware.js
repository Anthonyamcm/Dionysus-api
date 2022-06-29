const assert = require('assert');
const _ = require('lodash');
const util = require('util');
const { constantService } = require('../constant');
const response = require('../response/response.service');
const { jwtService } = require('../security/index');
const { strings } = require('../constant');
const User = require('../database/models/user.model');
const status = require('../response/status.code');
const sessionService = require('../services/session.service');
const utilService = require('../utils');
const { dbHelper } = require('../database');

const { DB_TYPE } = process.env;

const checkUserAuth = async (req) => {
	try {
		const { authorisedUser } = req;
		assert(authorisedUser, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

		const user = await dbHelper.fetchOne(User, {
			query: { _id: authorisedUser._id },
			middleware: req.middleware,
			populate: 'role',
		});
		assert(user, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));
		assert(user.role, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

		return user;
	} catch (error) {
		throw error;
	}
};

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
					req.originalUrl.includes('/pre-register') ||
					req.originalUrl.includes('/forget/password') ||
					req.originalUrl.includes('/card/by-app') ||
					req.originalUrl.includes('/users/check') ||
					req.originalUrl.includes('/kyb') ||
					req.originalUrl.includes('/sign') ||
					req.originalUrl.includes('/migration/submit')
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

	async admin(req, res, next) {
		try {
			const user = await checkUserAuth(req);
			let isValidRole = false;
			let isDeputy = false;

			for (const userRole of user.role) {
				if (
					userRole.slug === constantService.ROLE.ADMIN ||
					userRole.slug === constantService.ROLE.SIGNATORY ||
					userRole.slug === constantService.ROLE.DEPUTY_ADMIN
				) {
					isValidRole = true;

					if (userRole.slug === constantService.ROLE.DEPUTY_ADMIN) {
						isDeputy = true;
					}
				}
			}
			assert(isValidRole, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));
			if (isDeputy) {
				req.userRole = constantService.ROLE.DEPUTY_ADMIN;
			} else {
				req.userRole = constantService.ROLE.ADMIN;
			}

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async adminType(req, res, next) {
		try {
			const user = await checkUserAuth(req);
			let isValidRole = false;
			let isReadOnly = false;
			let isDeputy = false;
			for (const userRole of user.role) {
				if (
					userRole.slug === constantService.ROLE.ADMIN ||
					userRole.slug === constantService.ROLE.SIGNATORY ||
					userRole.slug === constantService.ROLE.DEPUTY_ADMIN ||
					userRole.slug === constantService.ROLE.ADMIN_READ_ONLY
				) {
					isValidRole = true;

					if (userRole.slug === constantService.ROLE.ADMIN_READ_ONLY) {
						isReadOnly = true;
					}
					if (userRole.slug === constantService.ROLE.DEPUTY_ADMIN) {
						isDeputy = true;
					}
				}
			}
			assert(isValidRole, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));
			if (isReadOnly) {
				req.userRole = constantService.ROLE.ADMIN_READ_ONLY;
			} else if (isDeputy) {
				req.userRole = constantService.ROLE.DEPUTY_ADMIN;
			} else {
				req.userRole = constantService.ROLE.ADMIN;
			}

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async notdeputy(req, res, next) {
		try {
			assert(req.userRole !== constantService.ROLE.DEPUTY_ADMIN, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async superAdmin(req, res, next) {
		try {
			// const user = await checkUserAuth(req);
			const { authorisedUser } = req;
			assert(authorisedUser, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			const user = await dbHelper.fetchOne(User, {
				query: {
					_id: authorisedUser._id,
				},
				populate: 'role',
			});
			assert(user, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));
			assert(user.role, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			let isValidRole = false;

			for (const userRole of user.role) {
				if (userRole.slug === constantService.ROLE.SUPER_ADMIN) {
					isValidRole = true;
				}
			}
			assert(isValidRole, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			req.userRole = constantService.ROLE.SUPER_ADMIN;

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async signatory(req, res, next) {
		try {
			const user = await checkUserAuth(req);
			let isValidRole = false;

			for (const userRole of user.role) {
				if (userRole.slug === constantService.ROLE.SIGNATORY) {
					isValidRole = true;
				}
			}
			assert(isValidRole, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			req.userRole = constantService.ROLE.SIGNATORY;

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async cardHolder(req, res, next) {
		try {
			const user = await checkUserAuth(req);
			let isValidRole = false;

			for (const userRole of user.role) {
				if (userRole.slug === constantService.ROLE.CARDHOLDER) {
					isValidRole = true;
				}
			}
			assert(isValidRole, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			req.userRole = constantService.ROLE.CARDHOLDER;

			next();
		} catch (e) {
			response.exception(res, e);
		}
	},

	async otp(req, res, next) {
		try {
			const { token, mobile, otp } = req.headers;
			const otpResult = await otpService.isVerified(req, {
				token,
				mobile,
				otp,
			});
			assert(otpResult, util.format(utilService.errorService.showMessage(strings.VALIDATION_ERROR.NOT_AUTHORIZE)));

			// data token record from database
			next();
		} catch (e) {
			response.exception(res, e);
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
				setDefaultLanguage(application);
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
				setDefaultLanguage(application);
			}

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
