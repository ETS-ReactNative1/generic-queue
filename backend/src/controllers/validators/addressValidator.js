const Joi = require('joi');

module.exports = validate = (body) => {
    let schema = Joi.object({
        _id: Joi.string().allow("", null),
        cep: Joi.string().required().replace(/\D/g, ''),
        state: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        neighborhood: Joi.string().required(),
        number: Joi.string().required(),
        complement: Joi.string().optional().max(100).allow(""),
    });

    const { error } = schema.validate(body);

    if (error && error.details) {
        return error.details.map((d) => d.message).join(", ");
    }
};
