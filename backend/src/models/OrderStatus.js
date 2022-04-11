const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderStatusSchema = new Schema({
    value: { type: String },
    isDeleteable: { type: Boolean },
    isCancelable: { type: Boolean }
}, { timestamps: false });

module.exports = mongoose.model('OrderStatus', OrderStatusSchema);