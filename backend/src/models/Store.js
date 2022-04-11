const moongose = require('mongoose');
const Address = require('./Address');
const Item = require('./Item');
const User = require('./User');
const imageHandler = require('../utils/imageHandler');

const StoreSchema = new moongose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  phoneNumber: { type: String, require: true },
  address: { type: moongose.Schema.Types.ObjectId, ref: 'Address', require: true },
  cnpj: { type: String, require: true },
  manager: { type: moongose.Schema.Types.ObjectId, ref: 'User' },
  orders: [{ type: moongose.Schema.Types.ObjectId, ref: 'Order' }],
  status: [{ type: moongose.Schema.Types.ObjectId, ref: 'OrderStatus' }],
  photoUri: { type: String },
});

StoreSchema.pre('findOneAndDelete', function (next) {
  this.model.findById(this.getQuery()._id)
    .then((store) => {
      // need to check if some orders is scheduled first (only this dont permit the store to be deleted)
      Item.find({ store: store._id })
        .then(items => {
          items.forEach(item => imageHandler.delete(item.photoUri));
        })
        .then(() => {
          Item.deleteMany({ store: store._id })
            .then(() => {
              Address.findByIdAndDelete(store.address)
                .then(() => {
                  User.findByIdAndDelete(store.manager)
                    .then(next)
                    .catch((next))
                })
                .catch(next)
            })
            .catch(next);
          imageHandler.delete(store.photoUri);
          next();
        }).catch(next);
    })
    .catch(next);
});


module.exports = moongose.model('Store', StoreSchema);