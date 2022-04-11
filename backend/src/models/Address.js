const moongose = require('mongoose');

const AddressSchema = new moongose.Schema({
  cep: { type: String, required: true },
  street: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  number: { type: String, required: true },
  complement: { type: String },
  coords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

module.exports = moongose.model('Address', AddressSchema);