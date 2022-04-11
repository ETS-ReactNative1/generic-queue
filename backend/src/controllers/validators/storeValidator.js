const Joi = require('joi');
const User = require('../../models/User');
const Store = require('../../models/Store');
const { userSchema, updateUserSchema } = require('./userValidator');

exports.createValidate = async (body) => {
  let schema = Joi.object({
    store: {
      photoUri: Joi.string().optional().allow(""),
      name: Joi.string().required(),
      email: Joi.string().required().regex(/^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i),
      phoneNumber: Joi.string().required().replace(/\D/g, ''),
      cnpj: Joi.string().required().replace(/\D/g, ''),
      status: Joi.array().items(Joi.object({
        isCancelable: Joi.boolean(),
        isDeleteable: Joi.boolean(),
        value: Joi.string()
      })),
      address: Joi.object({
        cep: Joi.string().required().replace(/\D/g, ''),
        state: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        neighborhood: Joi.string().required(),
        number: Joi.string().required(),
        complement: Joi.string().optional().max(100).allow(""),
      }).required()
    },
    manager: {
      ...userSchema()
    }
  });

  const { error } = schema.validate(body);
  if (error && error.details) {
    return error.details.map((d) => d.message).join(", ");
  }

  const existingUser = await User.findOne({
    $or: [
      { email: body.manager.email },
      { phoneNumber: body.manager.phoneNumber },
      { document: body.manager.document }
    ]
  });
  if (existingUser) {
    if (existingUser.email === body.manager.email)
      return 'Gerente: Email já registrado';
    else if (existingUser.phoneNumber === body.manager.phoneNumber)
      return 'Gerente: Número de telefone já registrado';
    else
      return 'Gerente: Documento já registrado';
  }
  const existingStore = await Store.findOne({
    $or: [
      { email: body.store.email },
      { phoneNumber: body.store.phoneNumber },
      { cnpj: body.store.cnpj }
    ]
  });
  if (existingStore) {
    if (existingStore.email === body.store.email)
      return 'Loja: Email já registrado';
    else if (existingStore.phoneNumber === body.store.phoneNumber)
      return 'Loja: Número de telefone já registrado';
    else
      return 'Loja: CNPJ já registrado';
  }
};

exports.updateValidate = async (body) => {
  let schema = Joi.object({
    store: Joi.object({
      _id: Joi.string().optional(),
      photoUri: Joi.string().optional().allow(""),
      name: Joi.string().optional(),
      email: Joi.string().optional().regex(/^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i),
      phoneNumber: Joi.string().optional().replace(/\D/g, ''),
      cnpj: Joi.string().optional().replace(/\D/g, ''),
      status: Joi.array().items(Joi.object({
        _id: Joi.string().allow(null),
        isCancelable: Joi.boolean(),
        isDeleteable: Joi.boolean(),
        value: Joi.string(),
      })),
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
    }),
    manager: Joi.object({
      ...updateUserSchema()
    })
  });

  const { error } = schema.validate(body);
  if (error && error.details) {
    return error.details.map((d) => d.message).join(", ");
  }
  if (body.manager) {
    const existingUser = await User.findOne({
      _id: { $ne: body.manager._id },
      $or: [
        { email: body.manager.email },
        { phoneNumber: body.manager.phoneNumber },
        { document: body.manager.document }
      ]
    });
    if (existingUser) {
      if (existingUser.email === body.manager.email)
        return 'Gerente: Email já registrado';
      else if (existingUser.phoneNumber === body.manager.phoneNumber)
        return 'Gerente: Número de telefone já registrado';
      else
        return 'Gerente: Documento já registrado';
    }
  }
  if (body.store) {
    const existingStore = await Store.findOne({
      _id: { $ne: body.store._id },
      $or: [
        { email: body.store.email },
        { phoneNumber: body.store.phoneNumber },
        { cnpj: body.store.cnpj }
      ]
    });
    if (existingStore) {
      if (existingStore.email === body.store.email)
        return 'Loja: Email já registrado';
      else if (existingStore.phoneNumber === body.store.phoneNumber)
        return 'Loja: Número de telefone já registrado';
      else
        return 'Loja: CNPJ já registrado';
    }
  }
};
