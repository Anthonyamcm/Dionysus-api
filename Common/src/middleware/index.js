const path = require('path');
const fs = require('fs');
const statusCode = require('../response/status.code');
const { constantService } = require('../constant');
const e2e = require('../security/e2e.service');
const { commonMiddleware, commonApplicationSetup } = require('./common.middleware');
const authMiddleware = require('./auth.middleware');

module.exports = {
	before(req, res, next) {
		// decodeURIComponent query string
		const query = JSON.stringify(req.query);
		req.query = JSON.parse(decodeURIComponent(query));
		// decrypted request body
		const contentType = req.headers['content-type'];

		if (process.env.IS_DECRYPT === 'true' && contentType === 'application/json' && (req.method === 'POST' || req.method === 'PATCH')) {
			req.body = e2e.prepareDecrypt(req.body, req.headers.platform);
		}

		next();
	},

	ehiBasicAuth(routePath) {
		function base64Encode(str) {
			return Buffer.from(str).toString('base64');
		}

		function EHIBasicAuthHandler(req, res, next) {
			// if (req.originalUrl.match(new RegExp(`^/${routePath}`))) {
			if (req.originalUrl.startsWith(`/${routePath}`)) {
				if (req.headers.authorization) {
					const { authorization } = req.headers;
					const authBase64 = authorization.substring('Basic '.length);
					const username = process.env.EHI_USERNAME;
					const password = process.env.EHI_PASSWORD;

					if (authBase64 === base64Encode(`${username}:${password}`)) {
						next();
					} else {
						res.status(401).json({
							status: 'error',
							message: 'Unauthorized',
							code: 401,
						});
					}
				} else {
					res.status(401).json({
						status: 'error',
						message: 'Unauthorized',
						code: 401,
					});
				}
			}

			// next();
		}

		return EHIBasicAuthHandler;
	},

	routeNotFound(req, res, next) {
		const route = req.originalUrl;
		const fullUrl = `${req.protocol}://${req.get('host')}${route}`;

		if (req.originalUrl === '/' || req.originalUrl === '/health') {
			let pathDockerRun = path.resolve(__dirname, '../../.pipeline/Dockerrun.aws.json');

			if (!fs.existsSync(pathDockerRun)) {
				pathDockerRun = path.resolve(__dirname, '../Dockerrun.aws.json');
			}

			const rawdata = fs.readFileSync(path.resolve(__dirname, pathDockerRun));
			const dockerrun = JSON.parse(rawdata);
			const { Image } = dockerrun;
			const version = Image.Name.split(':')[1];

			res.status(200).json({
				application: constantService.MICRO_SERVICES.MICRO_SERVICE_NAME,
				message: constantService.MICRO_SERVICES.WELCOME,
				version: `Version ${version}`,
				status: statusCode.success.status,
				code: statusCode.success.code,
			});
		} else if (route.startsWith('/wsdl')) {
			next();
		} else {
			res.status(statusCode.notFound.code).json({
				status: 'error',
				message: `${fullUrl}, ${statusCode.notFound.text}`,
				code: 404,
			});
		}
	},

	commonMiddleware,
	commonApplicationSetup,
	authMiddleware,
};
