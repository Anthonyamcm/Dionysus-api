const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema(
	{
		token: {
			type: String,
			index: { background: false },
		},
		session_id: {
			type: String,
			index: { background: false },
		},
		platform: String,
		os: String,
		is_active: Boolean,
		user: {
			type: 'ObjectId',
			ref: 'User',
			index: { background: false },
		}
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('SessionLogin', schema);