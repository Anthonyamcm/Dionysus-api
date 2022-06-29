const status = require('./status.code');
const { constantService } = require('../constant');
const utilService = require('../utils');

module.exports = {
	success(res, message, code, options) {
		const contentType = res.get('Content-type');

		if (res.headerSent) {
			return;
		}

		if (contentType === 'application/xml') {
			return res.send(message);
		}

		if (typeof code === 'object') {
			// eslint-disable-next-line no-param-reassign
			options = code;
			// eslint-disable-next-line no-param-reassign
			code = 200;
		}

		res.status(parseInt(code, 10) || 200).json({
			status: 'success',
			result: message,
			code: code || 200,
			options,
		});
	},

	error(res, message, code, options) {
		if (res.headerSent) {
			return;
		}

		res.status(parseInt(code, 10) || 400).json({
			status: 'error',
			result: message,
			code: code || 400,
			options,
		});
	},

	async exception(res, exception, code, options) {
		const logicError = exception.name === 'AssertionError [ERR_ASSERTION]';
		const messageObject =
			typeof exception.message === 'object'
				? exception.message
				: {
						text: exception.message,
						status: code || 500,
				  };
		let displayMessage = '';

		// internal server error
		if (!logicError) {
			// displayMessage = (options && options.defaultText) || "Sorry, there was an internal server error";
			displayMessage = messageObject.text || exception.message || options.defaultText || 'Sorry, there was an internal server error';

			if (process.env.NODE_ENV === 'production') {
				// send email to support team
			}
			// the error from assert
		} else {
			messageObject.status = status.badRequest.code;
			displayMessage = messageObject.text || exception.message || options.defaultText || 'Sorry, there was an internal server error';
		}

		let userInfo = '';

		if (res.req.authorisedUser) {
			const user = res.req.authorisedUser;
			userInfo = `${user.first_name} ${user.last_name} --- ${user.email} --- ${user._id}`;
		}

		// await logger.info(isDebug)
       
		const stack = {
			url: res.req.originalUrl,
			err: messageObject.text || exception.message,
			stack: exception.stack || exception,
			state: exception.state || '',
			user: userInfo,
			from: res.req.middleware && res.req.middleware.application ? res.req.middleware.application.iss :{MICRO_SERVICE_NAME: 'API'},
			options,
			exception,
		};

		if (res.headerSent) {
			return;
		}

		const statusCode = parseInt(code, 10) || parseInt(messageObject.status, 10) || 500;

		try {
			const response = {
				status: exception.info || 'error',
				result: displayMessage,
				code: statusCode,
				options: stack,
				from: "API",
				url: res.req.originalUrl,
			};
			res.status(statusCode).json(response);
		} catch (e) {
			console.log('error from response', e);
		}
	},
};
