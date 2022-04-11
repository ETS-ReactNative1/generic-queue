const Joi = require("joi");
const UserRoles = require("../../models/enums/UserRoles");
const User = require('../../models/User');

const createUserValidator = () => ({
  name: Joi.string().required(),
  email: Joi.string().required().regex(/^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i),
  phoneNumber: Joi.string().required().replace(/\D/g, ''),
  birthday: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().required().allow(...Object.values(UserRoles)),
  document: Joi.string().required().replace(/\D/g, ''),
  address: Joi.object({
    cep: Joi.string().required().replace(/\D/g, ''),
    state: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    neighborhood: Joi.string().required(),
    number: Joi.string().required(),
    complement: Joi.string().optional().max(100).allow(""),
  })
});

const updateUserValidator = () => ({
  _id: Joi.string().optional(),
  name: Joi.string().optional(),
  email: Joi.string().optional().regex(/^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i),
  phoneNumber: Joi.string().optional().replace(/\D/g, ''),
  birthday: Joi.string().optional(),
  oldPassword: Joi.string().optional(),
  newPassword: Joi.string().optional(),
  role: Joi.string().optional().allow(...Object.values(UserRoles)),
  document: Joi.string().optional().replace(/\D/g, ''),
  address: Joi.object({
    _id: Joi.string().optional(),
    cep: Joi.string().optional().replace(/\D/g, ''),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    street: Joi.string().optional(),
    neighborhood: Joi.string().optional(),
    number: Joi.string().optional(),
    complement: Joi.string().optional().max(100).allow(""),
  })
});


module.exports = {
  userSchema: createUserValidator,
  updateUserSchema: updateUserValidator,
  createValidate: async (user) => {
    let schema = Joi.object({
      ...createUserValidator()
    });

    const { error } = schema.validate(user);

    if (error && error.details) {
      return error.details.map((d) => d.message).join(", ");
    }
    const existingUser = await User.findOne({
      $or: [
        { email: user.email },
        { phoneNumber: user.phoneNumber },
        { document: user.document }
      ],
      role: user.role
    });
    if (existingUser) {
      if (existingUser.email === user.email)
        return 'Email já registrado';
      else if (existingUser.phoneNumber === user.phoneNumber)
        return 'Número de telefone já registrado';
      else
        return 'Documento já registrado';
    }
  },
  updateValidate: async (user) => {
    let schema = Joi.object({
      ...updateUserValidator()
    });

    const { error } = schema.validate(user);

    if (error && error.details) {
      return error.details.map((d) => d.message).join(", ");
    }
    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { email: user.email },
        { phoneNumber: user.phoneNumber },
        { document: user.document }
      ],
      role: user.role
    });
    if (existingUser) {
      if (existingUser.email === user.email)
        return 'Email já registrado';
      else if (existingUser.phoneNumber === user.phoneNumber)
        return 'Número de telefone já registrado';
      else
        return 'Documento já registrado';
    }
  }
}
