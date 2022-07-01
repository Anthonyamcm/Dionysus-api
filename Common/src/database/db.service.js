const mongoose = require('mongoose');
const dbHelper = require('./db.helper');

const {DB_DATABASE} = process.env;
let uri = "mongodb+srv://anthonyamcmill:scotland@nexure.xjiap.mongodb.net/Dionysus?retryWrites=true&w=majority";

/**
 * Closes the connection to the mongo database.
 */
const gracefulExit = () => {
	try {
		mongoose.connection.close(() => {
			console.log(`${`Mongoose default connection with DB :${uri} is disconnected through app termination`}`);
			process.exit(0);
		});
	} catch (error) {
		console.log('gracefulExit Error');
		throw error;
	}
};

/**
 * Initializes the connection to the mongo database.
 */
const initializeDatabase = () => {
	return new Promise((resolve, reject) => {
		if (!global.db) {
			try {
				const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true};

				mongoose.connect(uri, connectionOptions); // mongodb://username:password@host:port/database

				if (DB_DATABASE === 'production') {
					console.log('****************** Database Production ******************');
				} else if (DB_DATABASE === 'staging') {
					console.log('****************** Database Staging ******************');
				} else {
					console.log('****************** Database Test ******************');
				}

				const db = mongoose.connection;
				db.on('error', console.error.bind(console, 'database connection error:'));
				db.once('open', () => {
					console.log('database connect successfully');
					resolve(global.db);
				});
				global.db = db;

				// If the Node process ends, close the Mongoose connection.
				process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

				// When the connection is disconnected.
				db.on('disconnected', () => {
					console.log('database connection disconnected successfully');
				});

				// When the connection is closed.
				db.on('close', () => {
					console.log('database connection closed successfully');
				});
			} catch (error) {
				reject(error);
			}
		} else {
			resolve(global.db);
		}
	});
};

module.exports = {
	dbHelper,
	initializeDatabase,
	gracefulExit,
};