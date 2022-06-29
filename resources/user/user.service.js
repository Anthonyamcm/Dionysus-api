const bcrypt = require('bcryptjs');
const _ = require('lodash');
const moment = require('moment');
const assert = require('assert');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const User = require('../../Common/src/database/models/user.model');

const constantService = require('../../Common/src/constant/constant.service');
const strings = require('../../Common/src/constant/localization.service');
const dbHelper = require('../../Common/src/database/db.helper');
const jwt = require('../../Common/src/security/jwt.service');
const utilService = require('../../Common/src/utils');
const passwordService = require('../../Common/src/security/password.service');
const userValidation = require('./user.validation');

module.exports = {

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
				sender_type: constantService.ROLE.CARDHOLDER,
				receiver: user._id.toString(),
				receiver_type: constantService.ROLE.CARDHOLDER,
				organization: user.organization ? user.organization.toString() : undefined,
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
    async register(req, value, throwDuplicationError = true) {
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
					// If a duplicate records was found and it's requested to throw an error, do just that.
			

			return user;
			
		} catch (error) {
			throw error;
		}
	},

}