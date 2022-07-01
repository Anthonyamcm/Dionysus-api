const bcrypt = require('bcryptjs');
const _ = require('lodash');
const moment = require('moment');
const assert = require('assert');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const User = require('../../Common/src/database/models/user.model');
const SessionLogin = require('../../Common/src/database/models/session-login.model');

const constantService = require('../../Common/src/constant/constant.service');
const strings = require('../../Common/src/constant/localization.service');
const dbHelper = require('../../Common/src/database/db.helper');
const jwt = require('../../Common/src/security/jwt.service');
const utilService = require('../../Common/src/utils');
const passwordService = require('../../Common/src/security/password.service');
const userValidation = require('./user.validation');


module.exports = {

	async login(req, params) {
		const { user } = params;
		assert(user, util.format(utilService.errorService.showMessage({text: 'Your request not authorize!',code: '178'})));

		// Issue jwt.
		const token = jwt.issue(
			{
				id: user._id,
				email: user.email,
			}
		);
		user.token = token;

		const { platform, os } = req.headers;
		const sessionId = req.headers['session-id'];

		// Check session exist or not.
		const sessionQuery = {
			user: user._id.toString(),
		};

		sessionQuery.session_id = sessionId;

		// Get the user's previous session from the DB.
		const sessionLogin = await dbHelper.fetchOne(SessionLogin, {
			query: sessionQuery,
			middleware: req.middleware,
		});

		// If the user doesn't have a previous session, add a new one into the DB.
		if (!sessionLogin) {

			const newSession = {
				token,
				session_id: sessionId,
				platform,
				os,
				is_active: true,
				user: user._id.toString(),
			};
			
			// Add the new session into the DB.
			await dbHelper.save(SessionLogin, {
				data: newSession,
				middleware: req.middleware,
			});

			if (!user.is_activated) {
				await dbHelper.fetchOneAndUpdate(User, {
					query: {
						_id: user._id.toString(),
					},
					value: {
						is_activated: true,
					},
					middleware: req.middleware,
				});
			}
		}
		// If the user has a previous session, update it with the issued JWT.
		else {
			// Check activation flag for users that have previously logged in just in case, as we have removed the check in GetLoginUser for BankIdLogin
			if (!user.is_activated) {
				assert(false, util.format(strings.RESPONSE_MESSAGE.ACCOUNT_HAS_NOT_ACTIVATED.text));
			}

			if (sessionLogin.session_id !== sessionId) {
				assert(false, utilService.errorService.showMessage(strings.VALIDATION_ERROR.ACCOUNT_IS_USING_ON_THE_OTHER_DEVICE));
			}

			// Update the session with the issued JWT.
			sessionLogin.token = token;
			sessionLogin.is_active = true;
			await sessionLogin.save();
		}

		// Delete sensitive data from the result.
		user.password = undefined;

		return user;
	},
	async getLoginUser(req, params) {
		const { value } = params;
		assert(value, utilService.errorService.showMessage({text: 'Code not found',code: '180'}));

		const passwordValidatedUsers = [];
		// Regular login.
			const query = { };
			// Email based login.
			if (value.email) {
				query.email = {
					$regex: new RegExp(`^${value.email}$`, 'i'),
				};
			}

			// Get all users that match the query.
			const userInfos = await dbHelper.find(User, {
				query,
				middleware: req.middleware,
			});
			assert(!_.isEmpty(userInfos), util.format(utilService.errorService.showMessage({text: 'Incorrect login details',code: '198'})));

			// Check if the passwords match.
			for (const userInfo of userInfos) {
				if (this.comparePassword(value.password, userInfo.password)) {
					if (params.takeFirst) {
						return userInfo;
					}

					passwordValidatedUsers.push(userInfo);
				}
			}
			assert(passwordValidatedUsers.length, util.format(utilService.errorService.showMessage({text: 'Incorrect login details',code: '198'})));

		return passwordValidatedUsers[0];

		
	},

	encryptPassword(plainText) {
		const salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(plainText, salt);
	},

	comparePassword(plainText, encryptedPassword) {
		return bcrypt.compareSync(plainText, encryptedPassword);
	},

    async resetPassword(req, value) {
		try {
			// Check valid token.
			const { password, token } = value;
			const redis = await redisService.getByTokenID(req, token);

			// Check expire token.
			const validateToken = jwt.verify(redis.token);
			assert(validateToken, utilService.errorService.showMessage(strings.VALIDATION_ERROR.INVALID_TOKEN));

			// Reset new password.
			const user = await this.getOnlyUserById(req, redis.user);
			user.password = this.encryptPassword(password);
			await user.save();

			// De-activate the redis record.
			redis.is_active = false;
			await redis.save();

			const { value: requestValue, error: requestError } = requestValidation.validatePostRequestChangePassword({
				sender: user._id.toString(),
				receiver: user._id.toString(),
				subject: 'Change password',
				accepted: true,
			});
			assert(!requestError, requestError);

			await requestService.postRequestChangePassword(req, requestValue);

			return user;
		} catch (error) {
			throw error;
		}
	},
    async register(req, value) {
		try {
	
            const validEmail = utilService.validationService.emailIsValid(value.email.toLowerCase());
			assert(validEmail, utilService.errorService.showMessage({text: 'Invalid email',code: '102'}));

			// Validate the password.
			const validPassword = utilService.validationService.checkPasswordValidation(value.password);
			assert(validPassword, utilService.errorService.showMessage({text: 'Invalid password',code: '101'}));

			const duplicateEmail = await dbHelper.fetchOne(User, {
				query: {
						email: {
							$regex: new RegExp(`^${value.emaile}$`, 'i'),
						},
					},
				middleware: req.middleware,
			});

            let user;

					// If no duplicate record found, insert the new user into the DB.
			if (!duplicateEmail) {
						
						// Create the user object to be added to the DB.
			    const newUserData = {
					first_name: value.last_name,
					last_name: value.first_name,
					email: value.email,
					password: this.encryptPassword(value.password),
					};

					// Add the new user to the DB.
					user = await dbHelper.save(User,{
							data: newUserData,
							middleware: req.middleware,
						},
					);

			} else {

                assert(false, utilService.errorService.showMessage({text:"Email already in use", code:"220"}))

            }

			user.password = undefined
			
			return user;
			
		} catch (error) {
			throw error;
		}
	},

}