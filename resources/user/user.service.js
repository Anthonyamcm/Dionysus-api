const bcrypt = require('bcryptjs');
const _ = require('lodash');
const assert = require('assert');
const util = require('util');
var ObjectId = require('mongodb').ObjectID;

const User = require('../../Common/src/database/models/user.model');
const Friend = require('../../Common/src/database/models/friends.model')
const SessionLogin = require('../../Common/src/database/models/session-login.model');
const Redis = require('../../Common/src/database/models/redis.model');

const strings = require('../../Common/src/constant/localization.service');
const dbHelper = require('../../Common/src/database/db.helper');
const jwt = require('../../Common/src/security/jwt.service');
const utilService = require('../../Common/src/utils');
const redisService = require('../redis/redis.service');
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


		// Get the user's previous session from the DB.
		const sessionLogin = await SessionLogin.findOne({user: user._id.toString()});

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
			const session = await dbHelper.save(SessionLogin, {
				data: newSession,
				middleware: req.middleware,
			});

		}
		// If the user has a previous session, update it with the issued JWT.
		else {
			// Check activation flag for users that have previously logged in just in case, as we have removed the check in GetLoginUser for BankIdLogin
		

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

			// Get all users that match the query.
			const userInfos = await User.findOne({email: value.email})
			assert(!_.isEmpty(userInfos), util.format(utilService.errorService.showMessage({text: 'Incorrect login details',code: '198'})));

			// Check if the passwords match.
			if (this.comparePassword(value.password, userInfos.password)) {
				return userInfos;
			}
			assert(passwordValidatedUsers.length, util.format(utilService.errorService.showMessage({text: 'Incorrect login details',code: '198'})));

		return userInfos;

		
	},
	async getUserDetailsById(req, value){

		// Get all users that match the query.
		const userInfos = await User.findOne(
			{
				_id: value.id
			},
			{
				"first_name": 1,
				"last_name": 1,
				"email": 1,
				"is_friends":{
					$in: [ObjectId(value.senderId) , "$friends.user"],
					$in : [3, "$friends.status"]
				},
				"friends_count": {
					$size: "$friends"
				}
			},
			{
				"friends": 
					{
						$slice: 10
					},
			})
			.populate('friends.user friends.status', "first_name last_name email")
			assert(!_.isEmpty(userInfos), util.format(utilService.errorService.showMessage({text: 'User not found',code: '198'})));


		return userInfos;
	},
	async sendFriendRequest(req, value){

		const { token, recieverId, senderId } = value

		const redis = await redisService.getByTokenID(req, token);

		const validateToken = jwt.verify(redis.token);
		assert(validateToken, utilService.errorService.showMessage({text: 'Invalid token'}));

		const userInfo = await User.findOne({_id: recieverId})
		assert(!_.isEmpty(userInfo), util.format(utilService.errorService.showMessage({text: 'User not found'})));

	
		await User.findOneAndUpdate(
			{ _id: senderId },
			{ $push: { friends:{ user: ObjectId(recieverId), status: 1 }}},
		)

		await User.findOneAndUpdate(
			{ _id: recieverId },
			{ $push: { friends:{ user: ObjectId(senderId), status: 0 }}},
		)

		return 
	},

	async acceptFriendRequest(req, value){

		const { token, recieverId, senderId } = value

		const redis = await redisService.getByTokenID(req, token);

		const validateToken = jwt.verify(redis.token);
		assert(validateToken, utilService.errorService.showMessage({text: 'Invalid token'}));

		const userInfo = await User.findOne({_id: recieverId})
		assert(!_.isEmpty(userInfo), util.format(utilService.errorService.showMessage({text: 'User not found'})));

	
		await User.findOneAndUpdate(
			{ _id: senderId },
			{ $set: {'friends.status': 3}},
		)

		await User.findOneAndUpdate(
			{ _id: recieverId },
			{ $set: {'friends.status': 3}},
		)

		return 
	},
	async declineFriendRequest(req, value){

		const { token, recieverId, senderId } = value

		const redis = await redisService.getByTokenID(req, token);

		const validateToken = jwt.verify(redis.token);
		assert(validateToken, utilService.errorService.showMessage({text: 'Invalid token'}));

		const userInfo = await User.findOne({_id: recieverId})
		assert(!_.isEmpty(userInfo), util.format(utilService.errorService.showMessage({text: 'User not found'})));

	
		await User.findOneAndUpdate(
			{ _id: senderId },
			{ $pull: {friends: {user: ObjectId(recieverId)}}},
		)

		await User.findOneAndUpdate(
			{ _id: recieverId },
			{ $pull: {friends: {user: ObjectId(senderId)}}},
		)

		return 
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

			const duplicateEmail = await User.findOne({email: value.email})

            let user;

			console.log(duplicateEmail)

					// If no duplicate record found, insert the new user into the DB.
			if (!duplicateEmail) {
						
						// Create the user object to be added to the DB.
			    const newUserData = {
					first_name: value.first_name,
					last_name: value.last_name,
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