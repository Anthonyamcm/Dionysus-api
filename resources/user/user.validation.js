const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const constantService = require('../../Common/src/constant/constant.service');

module.exports = {
	/**
	 * Validates the parameters for registering a cardholder.
	 * @param {any} body The parameters.
	 * @returns The cardholder data or the validation error.
	 */
	validateRegisterUser(body) {
		const schema = Joi.object().keys({
			first_name: Joi.string().required(),
			last_name: Joi.string().required(),
			email: Joi.string().email().allow(null, ''),
			password: passwordComplexity().required(),
		});
		const { value, error } = schema.validate(body);

		if (error) {
			return {
				error,
			};
		}

		return {
			value,
		};
	},
	validateGetUser(body) {
		const schema = Joi.object().keys({
			id: Joi.string().required(),
			senderId: Joi.string().required()
		});
		const { value, error } = schema.validate(body);

		if (error) {
			return {
				error,
			};
		}
		return {
			value,
		};
	},
    validateLoginUser(body) {
		const schema =  Joi.object().keys({
				email: Joi.string().required(),
				password: passwordComplexity().required()
			});
			
		const { value, error } = schema.validate(body);

		if (error) {
			return { error };
		}

		return { value };
	},
    validateResetPassword(body) {
		const schema = Joi.object().keys({
			token: Joi.string().required(),
			password: passwordComplexity(constantService.PASSWORD_OPTIONS).required(),
			confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'must match password' }),
		});
		const { value, error } = schema.validate(body);

		if (error) {
			return { error };
		}

		return { value };
	},
    validateChangePassword(body) {
		const schema = Joi.object().keys({
			old_password: Joi.string(),
			new_password: Joi.string(),
		});
		const { value, error } = schema.validate(body);

		if (error) {
			return { error };
		}

		return { value };
	},

}