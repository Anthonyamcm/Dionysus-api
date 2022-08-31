const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema(
	{
		token_id: {
			type: String,
			index: { background: false },
		},
		token: {
			type: String,
		},
		session_id: {
			type: String,
		},
		platform: String,
		os: String,
		is_active: {
			type: Boolean,
			default: true,
		},
		user: {
			type: 'ObjectId',
			ref: 'User',
		},
		data: {
			type: Object,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('redis', schema);