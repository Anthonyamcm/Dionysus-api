const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        sender: { 
            type: 'ObjectId',
			ref: 'User',
			index: { background: false },
        },
        receiver: { 
            type: 'ObjectId',
			ref: 'User',
			index: { background: false },
        },
        status: Number,
        enums: [
            0, // requested
            1, // pending
            2, // accepted
            3  // rejeted
        ]
    }, {timestamps: true}
);

module.exports = mongoose.model('Friends', schema, 'Friends');