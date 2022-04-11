const Joi = require('joi');

exports.createValidation = (body) => {
    let schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow(""),
        photoUri: Joi.string().allow(""),
        price: Joi.number().required().positive(),
        options: Joi.array().items({
            name: Joi.string().required(),
            price: Joi.number().required(),
        }),
        isPricePerPage: Joi.boolean(),
        isAttachable: Joi.boolean(),
    });

    const { error } = schema.validate(body);

    if (error && error.details) {
        return error.details.map((d) => d.message).join(", ");
    }
};

exports.updateValidation = (body) => {
    let schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        photoUri: Joi.string().optional(),
        price: Joi.number().required(),
        options: Joi.array().items({
            name: Joi.string().required(),
            price: Joi.number().required(),
        }),
        store: Joi.string().required(),
        createdAt: Joi.string().required(),
        updatedAt: Joi.string().required(),
        isPricePerPage: Joi.boolean(),
        isAttachable: Joi.boolean(),
        _id: Joi.string(),
        __v: Joi.number().optional()
    });

    const { error } = schema.validate(body);

    if (error && error.details) {
        return error.details.map((d) => d.message).join(", ");
    }
}