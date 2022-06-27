const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const pointSchema = {
    name: { type: String, required: true},
    type: {type: String, enum: ['Point'], required: true},
    coordinates: { type: [Number], required: true }
  };

const schema = new Schema({
    title: { type: String, required: true},
    address: {type: String, required: true},
    loc: { type: Object, required: true},
    date: { type: Date, required: true},
    times: { type: Array, required: true},
    description: {type: String, required: true},
    imageURL: {type: String, required: true},
    companyID: {type: String, required: true},
    tags: {type: Array, required: true},
    created: {type: Date, default: Date.now}
    
});

schema.index({loc: "2dsphere"})

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('Events', schema, 'Events');