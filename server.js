require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const nunjucks = require('nunjucks');
const chalk = require('chalk');
const multer = require('multer');
const middleware = require('./Common/src/middleware');
const { initializeDatabase } = require('./Common/src/database');
const { initializeRedis } = require('./Common/src/redis');

const router = require('./routes');

const app = express();
app.disable('x-powered-by');
app.disable('Server');

/**
 * Express configuration.
 */
app.set('host', '0.0.0.0');
app.set('port', 8080);
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.text({ type: 'text/plain' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
	multer({
		dest: `${__dirname}/storages/tmp`,
	}).array('files', 12),
);
middleware.commonMiddleware(app);
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use(express.static(path.join(__dirname, './public'), { maxAge: 31557600000 }));
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure(app.get('views'), {
	express: app,
	autoescape: true,
});
app.set('view engine', 'html');

/**
 * Router - Primary app routes.
 */
app.use('*', middleware.before);
app.use('/api/', router);
app.use('', middleware.routeNotFound);

if (!global.db) {
	initializeDatabase();
}
if (!global.redis) {
	initializeRedis();
}

const server = http.createServer(app);

server.listen(8080, () => {
	console.log('%s%s App is running at http://localhost:%d', chalk.hex('#006f25').bold('✔︎ '), chalk.hex('#000000').bold.bgGreen(' RUNNING '), 8080);
	console.log('   %s', chalk.red('HTTP'));
	console.log('   LOCATION %s', chalk.blue(`http://localhost:${8080}`));
	console.log('  \nPress %s to stop\n', chalk.red('CTRL-C'));
});

module.exports = app;