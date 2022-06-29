const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const { JWT_PRIVATE_KEY, JWT_PUBLIC_KEY } = process.env;
const jwtPrivateKey = path.resolve(__dirname, `../certificates/jwt/${JWT_PRIVATE_KEY}`);
const jwtPublicKey = path.resolve(__dirname, `../certificates/jwt/${JWT_PUBLIC_KEY}`);

module.exports = {
	// expiresIn in second
	issue(payload, expiresIn) {
		// sign with RSA SHA256
		const key = fs.readFileSync(jwtPrivateKey);
		const passphrase = process.env.JWT_PASSPHRASE;
		const token = jwt.sign(payload, { key, passphrase }, { algorithm: 'RS256', expiresIn });

		return token;
	},

	verify(token) {
		const key = fs.readFileSync(jwtPublicKey);
		const payload = jwt.verify(token, key, { algorithms: ['RS256'] });

		return payload;
	},

	// Do not use for EB signed tokens, used currently only for Xero token to get a auth_event_id during sign in
	decode(token) {
		const payload = jwt.decode(token, { algorithms: ['RS256'] });
		return payload;
	},
};