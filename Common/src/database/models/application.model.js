const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		iss: {
			type: String,
			index: { background: false },
			required: true,
		},
		api_access: {
			type: String,
			index: { background: false },
			required: true,
			unique: true,
		},
		full_name: {
			type: String,
		},
		logo_url: {
			type: String,
		},
		access_key_id: {
			type: String,
			required: true,
			unique: true,
		},
		secret_access_key: {
			type: String,
			required: true,
			unique: true,
		},
		signicat: {
			type: Object,
		},
		remark: {
			type: String,
		},
		help: {
			type: String,
		},
		is_active: {
			type: Boolean,
			index: { background: false },
			default: true,
		},
		one_signal_api_key: {
			type: String,
		},
		one_signal_app_id: {
			type: String,
		},
		app_store_url: {
			type: String,
		},
		play_store_url: {
			type: String,
		},
		bank_language: {
			type: String,
		},
		sender_id: {
			type: String,
		},
		email_sender: {
			type: String,
		},
		email: {
			type: Object,
		},
		parent: {
			type: String,
		},
		bank_org_number: {
			type: String,
		},
		gps: {
			type: Object,
			// just add the type as object. we don't need to specific the field
			// logo_front_id: String,
			// logo_back_id: String,
			// product_ref: String,
			// carrier_type: String,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Application', userSchema);