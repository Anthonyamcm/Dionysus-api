const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const multer = require('multer');
const chalk = require('chalk');
const http = require('http');
const path = require('path');
const nunjucks = require('nunjucks');
const { initializeDatabase } = require('../database');
const { initializeRedis } = require('../redis');
const cronService = require('../cron/cron.service');

module.exports = {
	commonMiddleware(app) {
		app.use(morgan(':remote-addr - :remote-user [:date[clf]] :method :url :response-time ms :status :res[content-length]'));
		app.use(cors()); // If using in the same domain should disable this;
	},

	/**
	 * Generic application setup definition to create a service.
	 * @param {any} app The express application for the service.
	 * @param {any} options The application definition for the service.
	 */
	commonApplicationSetup(app, options) {
		// Disable or hide unwanted headers.
		if (options.disableHeaders && options.disableHeaders.length) {
			for (const disableHeader of options.disableHeaders) {
				if (disableHeader && typeof disableHeader === 'string') {
					app.disable(disableHeader);
				}
			}
		}

		if (options.hostValue) {
			app.set('host', options.hostValue);
		}

		app.set('port', options.portValue);
		app.use(
			express.json({
				limit: options.requestSizeLimit,
				extended: options.requestExtended,
			}),
		);
		app.use(
			express.text({
				type: 'text/plain',
			}),
		);
		app.use(
			express.urlencoded({
				limit: options.requestSizeLimit,
				extended: options.requestExtended,
			}),
		);

		if (options.setupStorageFolder) {
			app.use(
				options.multerFields && options.multerFields.length
					? /* Multer definition for specific fields. */
					  multer({
							dest: `${options.directoryName}/${options.storageFolderPath || 'storages/tmp'}`,
					  }).fields(options.multerFields)
					: /* Generic multer definition. */
					  multer({
							dest: `${options.directoryName}/${options.storageFolderPath || 'storages/tmp'}`,
					  }).array('files', 12),
			);
		}

		app.use(morgan(':remote-addr - :remote-user [:date[clf]] :method :url :response-time ms :status :res[content-length]'));

		// If using in the same domain should disable this.
		if (options.applyCors) {
			// CORS setup with options.
			if (options.corsOptions) {
				app.use(cors(options.corsOptions));
			}
			// Generic CORS setup.
			else {
				app.use(cors());
			}
		}

		if (options.setupStaticFolder) {
			app.use(
				express.static(path.join(options.directoryName, options.staticFolderName || './public'), {
					maxAge: options.staticFolderMaximumAge || 31557600000,
				}),
			);
		}

		if (options.setupViewEngine) {
			app.set('views', path.join(options.directoryName, 'views'));
			nunjucks.configure(app.get('views'), {
				express: app,
				autoescape: true,
			});
			app.set('view engine', 'html');
		}

		/* app.use(helmet());
		app.use(hpp());
		app.use((req, res, next) => {
			res.locals.user = req.user;
			next();
		}); */

		// Set up the routes.
		if (options.routes && options.routes.length) {
			for (const route of options.routes) {
				// Route definition with middlewares.
				if (route.middlewares && route.middlewares.length) {
					app.use(route.path, route.middlewares, route.router);
				}
				// Generic route definition.
				else {
					app.use(route.path, route.router);
				}
			}
		}

		// Set up connection to the database.
		if (options.setupDatabaseConnection && !global.db) {
			initializeDatabase();
		}

		// Set up connection to redis cache.
		if (options.setupRedis && !global.redis) {
			initializeRedis();
		}

		// Start the application server.
		const server = http.createServer(app);
		server.listen(options.portValue, async () => {
			// Initialize cron jobs.
			if (options.runCronService) {
				// Run generic cron service with the supplied collection of jobs.
				if (options.cronJobs && options.cronJobs.length) {
					await cronService.init(options.cronJobs);
				}
				// Run the provided custom cron services with static jobs.
				else if (options.customCronServices && options.customCronServices.length) {
					for (const customCronService of options.customCronServices) {
						if (customCronService && customCronService.init) {
							customCronService.init();
						}
					}
				}
			}

			// Initialize EHI.
			if (options.ehiService && options.ehiService.init) {
				options.ehiService.init(app);
			}

			console.log(
				'%s%s App is running at http://localhost:%d',
				chalk.hex('#006f25').bold('✔︎ '),
				chalk.hex('#000000').bold.bgGreen(' RUNNING '),
				options.portValue,
			);
			console.log('  \n   %s Mode', chalk.green(options.environmentValue.toUpperCase()));
			console.log('   %s', chalk.red('HTTP'));
			console.log('   LOCATION %s', chalk.blue(`http://localhost:${options.portValue}`));
			console.log('  \nPress %s to stop\n', chalk.red('CTRL-C'));
		});
	},
};