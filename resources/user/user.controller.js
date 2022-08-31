const assert = require('assert');
const util = require('util');
const mongoose = require('mongoose');
const constantService = require('../../Common/src/constant/constant.service');
const strings = require('../../Common/src/constant/localization.service');
const dbHelper = require('../../Common/src/database/db.helper');
const response = require('../../Common/src/response/response.service');
const jwt = require('../../Common/src/security/jwt.service');
const utilService = require('../../Common/src/utils');
const userService = require('./user.service');
const userValidation = require('./user.validation');

module.exports = {
    async register(req, res) {
		try {
			const { value, error } = userValidation.validateRegisterUser({
				...req.body,
			});
			assert(!error, error);

			const result = await userService.register(req, value);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async login(req, res) {
		try {
			const { value, error } = userValidation.validateLoginUser(req.body);
			assert(!error, error);

			const userInfo = await userService.getLoginUser(req, {
				value
			});

			const result = await userService.login(req, {
				user: userInfo
			});
			
			response.success(res, result);
		} catch (error) {
			response.exception(res, error);
		}
	},
    async logout(req, res) {
		try {
			const { value, error } = userValidation.validateUserLogout({
				user: req.authorisedUser._id.toString(),
			});
			assert(!error, error);

			const result = await userService.userLogout(req, value);
			response.success(res, result);
		} catch (error) {
			response.exception(res, error);
		}
	},
    async changePassword(req, res) {
		try {
			const { value, error } = userValidation.validateChangePassword(req.body);
			assert(!error, error);

			value.user = req.authorisedUser._id;
			value.session_id = req.headers['session-id'];
			const newPassword = await userService.changePassword(req, value);
			return response.success(res, newPassword);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async forgetPassword(req, res) {
		try {
			// TODO Check Platform
			if (req.body.phone) {
				req.body.mobile = req.body.phone;
				delete req.body.phone;
			}

			const { value, error } = userValidation.validateForgetPassword({
				session_id: req.headers['session-id'],
				platform: req.headers.platform,
				os: req.headers.os,
				...req.body,
			});
			assert(!error, error);

			const result = await userService.forgetPassword(req, value);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
    async resetPassword(req, res) {
		try {
			const { value, error } = userValidation.validateResetPassword(req.body);
			assert(!error, error);

			const result = await userService.resetPassword(req, value);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
    async uploadOwnProfilePhoto(req, res) {
		try {
			assert(req.files.length === 1, utilService.errorService.showMessage(strings.VALIDATION_ERROR.NO_MULTIPLE_FILE_UPLOAD_SUPPORT));

			req.body.referenceType = constantService.REF_TYPE.USERS;
			req.body.reference = req.authorisedUser._id;
			const data = {
				referenceType: constantService.REF_TYPE.USERS,
				reference: req.authorisedUser._id.toString(),
				files: req.files,
				mediaType: constantService.MEDIA.PROFILE,
				id: req.authorisedUser._id.toString(),
			};
			const userProfile = await mediaService.upload(req, data);

			const user = await userService.setUserProfilePhoto(req, userProfile[0]);
			return response.success(res, user);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async getUserDetails(req, res){
		try {
			const { value, error } = userValidation.validateGetUser({
				...req.body,
			});
			assert(!error, error);

			const result = await userService.getUserDetailsById(req, value);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async sendFriendRequest(req, res){
		try {
			const result = await userService.sendFriendRequest(req, req.body);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async acceptFriendRequest(req, res){
		try {
			const result = await userService.acceptFriendRequest(req, req.body);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	},
	async declineFriendRequest(req, res){
		try {
			const result = await userService.declineFriendRequest(req, req.body);
			return response.success(res, result);
		} catch (error) {
			return response.exception(res, error);
		}
	}
}