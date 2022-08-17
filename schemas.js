const Joi = require('joi');

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