const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    costumer: { type: Schema.Types.ObjectId, ref: 'User' },
    store: { type: Schema.Types.ObjectId, ref: 'Store' },
    cart: [{
        item: { type: Schema.Types.ObjectId, ref: 'Item' },
        optionsId: [{ type: String }]
    }, { require: true }],
    description: { type: String, default: "" },
    total: { type: Number },
    status: { type: Schema.Types.ObjectId, ref: 'OrderStatus', require: true },
    userConfirmedPayment: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    deliveryAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
}, {
    timestamps: true
});

OrderSchema.index({ _id: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('Order', OrderSchema);