const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const randomatic = require('randomatic');
const moment = require('moment');


module.exports = {
	convertObjectBooleanToUnderScoreDigit(object) {
		try {
			let result = '';
			_.map(object, (key) => {
				if (typeof key !== 'boolean') {
					throw new Error('Invalid conversion type');
				}
				result += key === true ? '_1' : '_0';
			});
			return result.slice(1);
		} catch (error) {
			throw error;
		}
	},

	convertObjectToArray(object) {
		try {
			return Object.keys(object).map((key) => object[key]);
		} catch (error) {
			throw error;
		}
	},

	findObjectInArray(elements, key, value) {
		try {
			for (const element of elements) {
				if (element[key] === value) {
					return element;
				}
			}
			return null;
		} catch (error) {
			throw error;
		}
	},

	arrayFromObject(obj) {
		const arr = [];
		for (const i in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, i)) {
				arr.push(obj[i]);
			}
		}
		return arr;
	},

	convertQueryExists(data) {
		try {
			const exists = data.split(',');
			const returnValue = {};

			for (const exist of exists) {
				if (exist.slice(0, 1) === '-') {
					returnValue[`${exist.slice(1, exist.length)}`] = {
						$exists: false,
					};
				} else {
					returnValue[exist] = {
						$exists: true,
					};
				}
			}

			return returnValue;
		} catch (error) {
			throw error;
		}
	},

	getKeyByValue(object, value) {
		return Object.keys(object).find((key) => object[key] === value);
	},

	toCapitalize(text) {
		return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
	},

	getRandomInt(max) {
		try {
			return Math.floor(Math.random() * Math.floor(max));
		} catch (error) {
			throw error;
		}
	},

	wsid() {
		try {
			const ran1 = this.getRandomInt('9999');
			const timestamp = `${moment().format('x')}${ran1}`;
			const ran = randomatic('0', 19 - timestamp.length);
			return `${timestamp}${ran}`;
		} catch (error) {
			throw error;
		}
	},


	stringYMD(date) {
		// https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
		let dd = date.getDate();
		let mm = date.getMonth() + 1; // January is 0!

		const yyyy = date.getFullYear();
		if (dd < 10) {
			dd = `0${dd}`;
		}
		if (mm < 10) {
			mm = `0${mm}`;
		}
		return `${yyyy}-${mm}-${dd}`;
	},

	nowYMD() {
		return this.stringYMD(new Date());
	},

	decode: (b64) => {
		assert(b64, 'Invalid base64 string');
		return Buffer.from(b64, 'base64').toString();
	},

	encodeByteArray: (byteArray) => Buffer.from(byteArray).toString('base64'),

	encodeString: (str) => Buffer.from(str).toString('base64'),

	encodeBase64(data) {
		try {
			return Buffer.from(data).toString('base64');
		} catch (error) {
			throw error;
		}
	},

	decodeBase64(data) {
		try {
			const decode = Buffer.from(data, 'base64');
			const text = decode.toString('ascii');
			return text;
		} catch (error) {
			throw error;
		}
	},

	convertStringDateToDate(data, returnDate = false) {
		try {
			let date = new Date(data);
			if (!data.includes('-')) {
				const year = data.substring(0, 4);
				const month = data.substring(4, 6);
				const day = data.substring(6, 8);
				date = new Date(year, month - 1, day);
			}
			if (returnDate) {
				return date;
			}
			return date.toISOString();
		} catch (error) {
			throw error;
		}
	},

	compressArray: (original) => {
		const compressed = [];
		// make a copy of the input array
		const copy = original.slice(0);

		// first loop goes over every element
		for (let i = 0; i < original.length; i++) {
			let myCount = 0;
			// loop over every element in the copy and see if it's the same
			for (let w = 0; w < copy.length; w++) {
				if (original[i] === copy[w]) {
					// increase amount of times duplicate is found
					myCount++;
					// sets item to undefined
					delete copy[w];
				}
			}

			if (myCount > 0) {
				const a = {};
				a.value = original[i];
				a.count = myCount;
				compressed.push(a);
			}
		}

		return compressed;
	},

	getCurrentDate() {
		const today = new Date();
		const dd = today.getDate();
		const mm = today.getMonth() + 1;
		const yyyy = today.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	},

	asyncForEach: async (array, callback) => {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	},

	getCounterFromObjectID(id) {
		const hexCounter = id.substring(id.length - 6, id.length);
		const counter = parseInt(hexCounter, 16);
		return counter;
	},

	convertArrayToObject(array) {
		try {
			const convertArray = Object.assign({}, ...array);
			return convertArray;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Extends the email options with cc and bcc values.
	 * @param {any} sendOptions The options for the email.
	 * @param {any} value The value containing the raw options.
	 * @returns The extended email options.
	 */
	extendSendOptions(sendOptions, value) {
		const options = sendOptions;

		// If the value contains at least one cc address.
		if (value.cc) {
			// If the default options already contains at least one cc address.
			if (options.cc) {
				// Convert the originally string into a collection.
				if (typeof options.cc === 'string') {
					options.cc = [options.cc];
				}

				// If the value's cc is string, append it to the collection.
				if (typeof value.cc === 'string') {
					options.cc.push(value.cc);
				}
				// Merge the two collections to the default options.
				else {
					options.cc = [...options.cc, ...value.cc];
				}
			}
			// If the default optins doesn't contain any cc addresses.
			else {
				options.cc = value.cc;
			}
		}

		// If the value contains at least one bcc address.
		if (value.bcc) {
			// If the default options already contains at least one bcc address.
			if (options.bcc) {
				// Convert the originally string into a collection.
				if (typeof options.bcc === 'string') {
					options.bcc = [options.bcc];
				}

				// If the value's bcc is string, append it to the collection.
				if (typeof value.bcc === 'string') {
					options.bcc.push(value.bcc);
				}
				// Merge the two collections to the default options.
				else {
					options.bcc = [...options.bcc, ...value.bcc];
				}
			}
			// If the default optins doesn't contain any bcc addresses.
			else {
				options.bcc = value.bcc;
			}
		}

		return options;
	},
};
