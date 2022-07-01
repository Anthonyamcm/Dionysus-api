const jwt = require('jsonwebtoken');

const jwtKey = "91oKqaxRYQfCNu7kIV9NuwSzJFmig6QNmDq74dUB919K6SXrh5SGFPXCh4WWkK3V-cO2HJOr156ktiEySo9kYoNhof4dzEWarFt16AtFAjKmKAvobQ-QXfM0cxs-IPHStPqIEtFT4f_ltOTiN8HYskJAJffxyOqNXUij0KGiY0k"

module.exports = {
	// expiresIn in second
	issue(payload) {
		// sign with RSA SHA256
		const key = jwtKey;
		const token = jwt.sign(payload, key, { algorithm: 'HS256', expiresIn: '1d' });

		return token;
	},

	verify(token) {
		const key = jwtKey;
		const payload = jwt.verify(token, key, { algorithms: ['HS256']});

		return payload;
	},

	// Do not use for EB signed tokens, used currently only for Xero token to get a auth_event_id during sign in
	decode(token) {
		const payload = jwt.decode(token, { algorithms: ['HS256'] });
		return payload;
	},
};