const Joi = require("joi");
  
const loginSchema = Joi.object({
    mobile_number: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
        "string.pattern.base": "Mobile number must be exactly 10 digits",
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number is required",
    }),
    password: Joi.string().required()
});

const termsSchema = Joi.object({
    lat: Joi.number()
    .required(),
    
    lng: Joi.number()
    .required(),
});
  
module.exports = {
    loginSchema,
    termsSchema
}