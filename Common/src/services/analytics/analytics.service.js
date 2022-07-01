const { dbHelper } = require('../../database');
const Analytics = require('../../database/models/analytics.model');
const sessionService = require('../session/session.service');

module.exports = {
	async log(log) {
		try {
			console.log(`[${log.type}] == ${log.desc} ${log.from} ==`);
			await dbHelper.save(Analytics, { data: log });
		} catch (error) {
			console.error('save analytics error', error);
		}
	},

	async save(req, service) {
		if (!req.authorisedUser) {
			await sessionService.assignAuthorisedUser(req);
		}
		const authUserApplication = req.authorisedUser && req.authorisedUser.application ? req.authorisedUser.application : undefined;
		const middlewareApplication = req.middleware && req.middleware.application ? req.middleware.application._id : undefined;

		const details = {
			headers: req.headers,
			raw_headers: req.rawHeaders,
			body: req.body,
			params: req.params,
			query: req.query,
			url: req.url,
			base_url: req.baseUrl,
			path: req.path,
			hostname: req.hostname,
			method: req.method,
			protocol: req.protocol,
			ip: req.ip,
			ips: req.ips,
			secure: req.secure,
		};

		const log = {
			service,
			details,
			url: req.originalUrl,
			platform: req.headers && req.headers.platform ? req.headers.platform.toLowerCase() : undefined,
			os: req.headers && req.headers.os ? req.headers.os.toLowerCase() : undefined,
			session: req.headers && req.headers['session-id'] ? req.headers['session-id'] : undefined,
			user: req.authorisedUser && req.authorisedUser ? req.authorisedUser._id : undefined,
			organization: req.authorisedUser && req.authorisedUser.organization ? req.authorisedUser.organization : undefined,
			application: authUserApplication || middlewareApplication || undefined,
		};
		await this.log(log);
	},
};