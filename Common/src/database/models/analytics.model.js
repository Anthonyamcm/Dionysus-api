const mongoose = require('mongoose');

const { Schema } = mongoose;

const Analytics = new Schema(
	{
		service: {
			type: String,
			index: { background: false },
		},
		url: {
			type: String,
			index: { background: false },
		},
		platform: {
			type: String,
		},
		os: {
			type: String,
		},
		details: {
			type: Object,
		},
		session: {
			type: String,
		},
		user: {
			type: 'ObjectId',
			ref: 'User',
		},
		organization: {
			type: 'ObjectId',
			ref: 'Organization',
		},
		application: {
			type: 'ObjectId',
			ref: 'Application',
		},
	},
	{
		timestamps: true,
		autoCreate: true,
	},
);

module.exports = mongoose.model('Analytics', Analytics);