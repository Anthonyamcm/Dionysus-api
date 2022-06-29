const CryptoJS = require('crypto-js');
const nodeRsa = require('node-rsa');

/**
 * Decrypts the given value.
 * @param {any} objectData The content to decrypt.
 * @param {string} reqPlatform The caller platform.
 * @param {string} privateKey The private key value.
 * @returns The plain text value after the decryption.
 */
const prepareDecrypt = (objectData, reqPlatform, privateKey) => {
	const data = objectData;
	const { c1, c2 } = data;
	const nodeRSA = nodeRsa({
		b: 512,
	});
	nodeRSA.constKey(privateKey);

	if (reqPlatform !== 'WEB') {
		nodeRSA.setOptions({
			encryptionScheme: 'pkcs1',
		});
	}

	const aesKEY = nodeRSA.decrypt(c2, 'utf8');
	const bytes = CryptoJS.AES.decrypt(c1.toString(), aesKEY).toString(CryptoJS.enc.Utf8);
	const plaintext = JSON.parse(bytes);

	return plaintext;
};

module.exports = {
	prepareDecrypt,
};