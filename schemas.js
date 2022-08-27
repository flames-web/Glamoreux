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
    name: Joi.string().min(1).required().escapeHTML(),
    price:Joi.number().min(0).required(),
    description:Joi.string().required().escapeHTML(),
    unit:Joi.number().required(),
    category:Joi.string().escapeHTML(),
    deleteImages: Joi.array()
})  


module.exports.categorySchema = Joi.object({
    category:Joi.string().required().escapeHTML(),
    catDescription:Joi.string().escapeHTML(),
})

module.exports.reviewSchema = Joi.object({
    message:Joi.string().required().escapeHTML(),
    rating:Joi.number(),
})