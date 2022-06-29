const bcrypt = require('bcryptjs');

/**
 * Encrypts a plain text password.
 * @param {string} plainText The plain text password.
 * @returns The encrypted password.
 */
const encryptPassword = (plainText) => {
	const salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(plainText, salt);
};

/**
 * Compares a plain text and an encrypted password.
 * @param {string} plainText The plain test password.
 * @param {string} encrypedPassword The encrypted password.
 * @returns True if the passwords match, false otherwise.
 */
const comparePasswords = (plainText, encrypedPassword) => {
	return bcrypt.compareSync(plainText, encrypedPassword);
};

module.exports = {
	encryptPassword,
	comparePasswords,
};