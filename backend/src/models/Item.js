const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    store: { type: Schema.Types.ObjectId, ref: 'Store', index: true, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    photoUri: { type: String },
    price: { type: Number, required: true },
    options: [{
        name: { type: String },
        price: { type: Number }
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);