const Joi = require("joi");

const createBatchSchema = Joi.object({
    date_of_manufacturing: Joi.date()
      .iso()
      .required(),
  
    quantity: Joi.number()
      .integer()
      .min(1)
      .required()
  });
  
  module.exports = {
    createBatchSchema
  }