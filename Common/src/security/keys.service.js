const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require('uuid');
const { encodeBase64 } = require('../utils/data.service');

module.exports = {
	createAccessKey() {
		const key = nanoid(5);
		const encodedKey = encodeBase64(key);
		return encodedKey;
	},

	createSecretKey() {
		const uuid = uuidv4();
		const nano = nanoid(5);
		const key = `${uuid}${nano}`;
		const encodedKey = encodeBase64(key);
		return encodedKey;
	},

	createApiKey() {
		const accessKey = this.createAccessKey();
		const secretKey = this.createSecretKey();
		const key = `${accessKey}${secretKey}`;
		const apiKey = encodeBase64(key);
		return { apiKey, secretKey, accessKey };
	},
};