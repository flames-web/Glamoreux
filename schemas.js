const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.productSchema = Joi.object({
    name: Joi.string().min(1).required(),
    price:Joi.number().min(0).required(),
    description:Joi.string().required(),
    unit:Joi.number().required(),
    category:Joi.string(),
    deleteImages: Joi.array()
})


module.exports.categorySchema = Joi.object({
    category:Joi.string().required(),
    catDescription:Joi.string()
})

module.exports.reviewSchema = Joi.object({
    message:Joi.string().required(),
    rating:Joi.number()
})