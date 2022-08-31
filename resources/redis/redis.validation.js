const Joi = require('joi');

module.exports = {
	validateSaveRedis(body) {
		const schema = Joi.object().keys({
			token_id: Joi.string().required(),
			token: Joi.string().required(),
			session_id: Joi.string().required(),
			platform: Joi.string(),
			os: Joi.string(),
			user: Joi.string(),
		});
		const { value, error } = schema.validate(body);

		if (error) {
			return { error };
		}

		return { value };
	}

}