const Joi = require('joi');

const farmerOnboardingSchema = Joi.object({
  name: Joi.string().required(),

  mobile_number: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),

  cattle_count: Joi.number()
    .integer()
    .required(),

  place: Joi.string()
    .required(),

  profile_pic: Joi.string()
    .allow('', null)
    .optional(),
  
  aadhar: Joi.string()
    .required(), 

  state: Joi.string()
    .required(),

  district: Joi.string()
    .required(),
  
  pincode: Joi.string()
  .pattern(/^\d{6}$/)
    .required(),

});

const feedDistributionSchema = Joi.object({
  batch_no: Joi.string().required(),

  quantity: Joi.number()
    .integer()
    .required(),
});

const feedConfirmSchema = Joi.object({
  batch_no: Joi.string().required(),
  
  lat: Joi.number()
    .required(),
    
  lng: Joi.number()
    .required(),
});

const fractionalOffsetSchema = Joi.object({
  farmer_id: Joi.number().integer().required(),
  farmer_custom_id: Joi.string().max(100).allow(null, ''),
  farmer_name: Joi.string().max(255).allow(null, ''),
  mobile_number: Joi.string().max(20).allow(null, ''),
  farmer_lat: Joi.number().allow(null),
  farmer_lng: Joi.number().allow(null),
  place: Joi.string().max(255).allow(null, ''),
  state: Joi.string().max(255).allow(null, ''),
  district: Joi.string().max(255).allow(null, ''),
  pincode: Joi.string().max(50).allow(null, ''),
  farmer_onboarding_date: Joi.date().iso().allow(null),
  cattle_id: Joi.string().max(100).allow(null, ''),
  feed_batch_id: Joi.string().max(100).allow(null),
  camp_lead_id: Joi.number().integer().allow(null),
  camp_lead_custom_id: Joi.string().max(100).allow(null, ''),
  camp_lead_lat: Joi.number().precision(8).allow(null),
  camp_lead_lng: Joi.number().precision(8).allow(null),
  log_date: Joi.date().iso().allow(null),
  feed_given: Joi.string().allow(null, ''),
  fractional_offset_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).allow(null),
  verification_date: Joi.date().iso().allow(null),
  verification_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).allow(null, ''),
  offset_value: Joi.number().allow(null, ''),
  note: Joi.string().allow(null, ''),
  aadhar: Joi.string().max(255).allow(null, ''),
});

const offsetVerificationSchema = Joi.object({
  verification_pic: Joi.string().allow('', null),
  verified_lat: Joi.number().allow(null),
  verified_lng: Joi.number().allow(null),
  fractional_offsets: Joi.array().items(fractionalOffsetSchema).min(1).required()
});



module.exports = { 
  farmerOnboardingSchema,
  offsetVerificationSchema,
  feedDistributionSchema,
  feedConfirmSchema
};