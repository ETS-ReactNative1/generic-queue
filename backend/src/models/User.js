const bcrypt = require('bcrypt');
const moongose = require('mongoose');
const Address = require('./Address');
const userRoles = require('./enums/UserRoles');

const UserSchema = new moongose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  birthday: { type: String },
  phoneNumber: { type: String, require: true },
  password: { type: String, require: true },
  document: { type: String, require: true },
  address: { type: moongose.Schema.Types.ObjectId, ref: 'Address' },
  role: { type: String, enum: userRoles, require: true, default: userRoles.COSTUMER },
});

UserSchema.index({ email: 1, role: 1 }, { unique: true });
UserSchema.index({ phoneNumber: 1, role: 1 }, { unique: true });
UserSchema.index({ document: 1, role: 1 }, { unique: true });

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, 9).then((hash) => {
    this.password = hash;
    next();
  }).catch(next);
});

UserSchema.pre('findOneAndUpdate', function (next) {
  const data = this.getUpdate();
  if (!data.password) {
    return next();
  }
  bcrypt.hash(data.password, 9).then((hash) => {
    data.password = hash;
    this.update({}, data).exec();
    next();
  }).catch(next);
});

UserSchema.pre('findOneAndDelete', async function (next) {
  this.model.findById(this.getQuery()._id)
    .then((user) => {
      Address.findByIdAndDelete(user.address)
        .then(next)
        .catch(() => {
          throw new Error('Não foi possível deletar o usuário. Motivo: Não foi possível deletar o endereço');
        })
    })
    .catch(() => {
      throw new Error('Não foi possível deletar o usuário');
    });
});

UserSchema.methods = {
  authenticate(password) {
    return bcrypt.compare(password, this.password).then((valid) => valid ? this : false);
  }
};

module.exports = moongose.model('User', UserSchema);