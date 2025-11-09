const Joi = require("joi");

const feedDistributionSchemas = Joi.object({
  type: Joi.string()
    .valid("feed_distribution", )
    .required()
    .messages({
        'any.required': 'Type is required',
        'any.only': 'Type must be "feed_distribution"',
        'string.base': 'Type must be a string',
      }),

  message: Joi.object({
    content: Joi.string()
    .required()
    .messages({
        'any.required': 'Message content is required for feed_distribution',
        'object.base': 'Message must be an object for feed_distribution',
    }),
  }).required(),
});

const respondMessageSchema = Joi.object({
    type: Joi.string()
      .valid("daily_feed_response", "feed_receipt")
      .required()
      .messages({
        'any.required': 'Type is required',
        'any.only': 'Type must be either "daily_feed_response" or "feed_receipt"',
        'string.base': 'Type must be a string',
      }),
  
    message: Joi.alternatives().conditional("type", [
      {
        is: "daily_feed_response",
        then: Joi.object({
          content: Joi.string()
            .required()
            .messages({
              'any.required': 'Content is required for daily_feed_response',
              'string.base': 'Content must be a string',
              'string.empty': 'Content cannot be empty',
            }),
        }).required().messages({
          'any.required': 'Message content is required for daily_feed_response',
          'object.base': 'Message must be an object for daily_feed_response',
        }),
      },
      {
        is: "feed_receipt",
        then: Joi.object({
          batch_no: Joi.string()
            .required()
            .messages({
              'any.required': 'Batch number is required for feed_receipt',
              'string.base': 'Batch number must be a string',
              'string.empty': 'Batch number cannot be empty',
            }),
          lat: Joi.number()
            .required()
            .messages({
              'any.required': 'Latitude is required for feed_receipt',
              'number.base': 'Latitude must be a number',
            }),
          lng: Joi.number()
            .required()
            .messages({
              'any.required': 'Longitude is required for feed_receipt',
              'number.base': 'Longitude must be a number',
            }),
        }).required().messages({
          'any.required': 'Message content is required for feed_receipt',
          'object.base': 'Message must be an object for feed_receipt',
        }),
      },
    ]),
  });

module.exports = {
    respondMessageSchema,
    feedDistributionSchemas
};
