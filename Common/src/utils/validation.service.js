const _ = require('lodash');

const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/**
 * Checks if the given password fulfills the requirements.
 * @param {string} password The plain text password to validate.
 * @returns True if the password passes the validation, false otherwise.
 */
const checkPasswordValidation = (password) => {
	const regex = /^(?=.*[\W_])[A-Za-z\d\W_]{8,}$/; // min 8 char, include 1 special char
	return regex.test(password); // valid password ? true : false
};

/**
 * Checks if the given first name fulfills the requirements.
 * @param {string} firstName The first name to validate.
 * @returns True if the first name passes the validation, false otherwise.
 */
const firstNameIsValid = (firstName) => {
	const regex = /^[a-zA-Z0-9_ Æ-æØ-øÅ-å.&-\w]{1,100}$/;
	return regex.test(firstName);
};

/**
 * Checks if the given last name fulfills the requirements.
 * @param {string} lastName The last name to validate.
 * @returns True if the last name passes the validation, false otherwise.
 */
const lastNameIsValid = (lastName) => {
	const regex = /^[a-zA-Z0-9_ Æ-æØ-øÅ-å.&-\w]{1,100}$/;
	return regex.test(lastName);
};

/**
 * Checks if the given email address fulfills the requirements.
 * @param {string} emailAddress The email address to validate.
 * @returns True if the email address passes the validation, false otherwise.
 */
const emailIsValid = (emailAddress) => {
	// eslint-disable-next-line no-useless-escape
	const regex = /^[a-zA-Z0-9.!#$%&\'*+\/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return regex.test(emailAddress);
};


/**
 * Checks if the given name fulfills the requirements.
 * @param {string} name The name to validate.
 * @returns True if the name passes the validation, false otherwise.
 */
const nameIsValid = (name) => {
	const regex = /^[a-zA-Z0-9_ Æ-æØ-øÅ-å.&-\w]{1,200}$/;
	return regex.test(name);
};

/**
 * Checks if the given date of birth fulfills the requirements.
 * @param {string} dateOfBirth The date of birth to validate.
 * @returns True if the date of birth passes the validation, false otherwise.
 */
const dobIsValid = (dateOfBirth) => {
	const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
	return regex.test(dateOfBirth);
};


/**
 * Compares the two passwords.
 * @param {string} password The plain text password.
 * @param {string} confirmPassword The plain text password confirm.
 * @returns True if the two match, false otherwise.
 */
const validatePasswordsMatch = (password, confirmPassword) => {
	if (!password || !confirmPassword || !checkPasswordValidation(password) || !checkPasswordValidation(confirmPassword)) {
		return false;
	}

	return _.isEqual(password, confirmPassword);
};

const validateKontonummerMod11 = (kontonummer) => {
	const kontonummerWithoutSpacesAndPeriods = kontonummer.replace(/[\s.]+/g, '');

	if (kontonummerWithoutSpacesAndPeriods.length !== 11) {
		return false;
	}

	const sjekksiffer = Number.parseInt(kontonummerWithoutSpacesAndPeriods.charAt(10), 10);
	const kontonummerUtenSjekksiffer = kontonummerWithoutSpacesAndPeriods.substring(0, 10);
	let sum = 0;

	for (let index = 0; index < 10; index += 1) {
		sum += Number.parseInt(kontonummerUtenSjekksiffer.charAt(index), 10) * weights[index];
	}

	const computedSjekksiffer = 11 - (sum % 11);
	return computedSjekksiffer === sjekksiffer;
};

module.exports = {
	checkPasswordValidation,
	firstNameIsValid,
	lastNameIsValid,
	emailIsValid,
	nameIsValid,
	dobIsValid,
	validatePasswordsMatch,
	validateKontonummerMod11,
};
