const Joi = require('joi');
const orderTypeValidation = require('../../models/enums/orderTypeValidation');

const createValidate = () => ({
  cart: Joi.array().items(Joi.object({
    item: Joi.string(),
    optionsId: Joi.array().items(Joi.string())
  })).required(),
  deliveryAddress: Joi.alternatives(
    Joi.string(),
    Joi.object()
  ).allow(null),
  userId: Joi.string().required(),
  description: Joi.string().allow(""),
});

const userValidate = () => ({
  isCanceled: Joi.boolean().optional(),
  userConfirmedPayment: Joi.boolean().optional(),
});

const storeValidate = () => ({
  isCanceled: Joi.boolean().optional(),
  isPaid: Joi.boolean().optional(),
  status: Joi.string().optional(),
});

module.exports = validate = (type, body) => {
  let schema;
  switch (type) {
    case orderTypeValidation.CREATE:
      schema = Joi.object({
        ...createValidate()
      });
      break;
    case orderTypeValidation.USER_UPDATE:
      schema = Joi.object({
        ...userValidate()
      });
      break;

    case orderTypeValidation.STORE_UPDATE:
    default:
      schema = Joi.object({
        ...storeValidate()
      });
      break;
  }

  const { error } = schema.validate(body);

  if (error && error.details) {
    return error.details.map((d) => d.message).join(", ");
  }
};
