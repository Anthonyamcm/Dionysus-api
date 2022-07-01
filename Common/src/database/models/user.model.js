const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        first_name: { 
            type: String, 
            required: true 
        },
        last_name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            unique: true, 
            required: true
        },
        password: { 
            type: String, 
            required: true 
        },
        is_activated: {
			type: Boolean,
			default: false,
		},
        token: {
            type: String,
        },

    }
);

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('User', schema, 'User');