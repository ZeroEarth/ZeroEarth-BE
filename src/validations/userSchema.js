const Joi = require('joi');

const createUserSchema = Joi.object({
  role: Joi.string().valid('admin', 'manufacturer', 'camp_lead','auditor', 'farmer').required(),
  mobile_number: Joi.string().pattern(/^\d{10}$/).required(),

  name: Joi.string().required(),
  password: Joi.string().required(),

  // Fields for manufacturer
  location: Joi.when('role', {
    is: 'manufacturer',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),

  // Fields for camp_lead
  cattle_count: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.number().integer().required(),
    otherwise: Joi.forbidden()
  }),
  profile_pic: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string()
    .allow('', null)
    .optional(),
    otherwise: Joi.forbidden()
  }),
  aadhar: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string().pattern(/^\d{12}$/).required(),
    otherwise: Joi.forbidden()
  }),
  place: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  state: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  district: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  pincode: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.string().pattern(/^\d{6}$/).required(),
    otherwise: Joi.forbidden()
  }),
  manufacturer_id: Joi.when('role', {
    is: 'camp_lead',
    then: Joi.number().integer().required(),
    otherwise: Joi.forbidden()
  })
});

const editCampLeadSchema = Joi.object({
  name: Joi.string().required(),
  mobile_number: Joi.string().pattern(/^\d{10}$/).required(),
  place: Joi.string().required(),
  state: Joi.string().required(),
  district: Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  aadhar: Joi.string().pattern(/^\d{12}$/).required(),
  cattle_count: Joi.number().integer().required(),
  farmer_id: Joi.number().integer().required(), // for identifying which camp lead
  password: Joi.string().min(4).optional(),
  manufacturer_id: Joi.number().integer().required()
});

/** --- Manufacturer Edit Schema --- */
const editManufacturerSchema = Joi.object({
  name: Joi.string().required(),
  muid: Joi.string().required(),
  location: Joi.string().required(),
  mobile_number: Joi.string().pattern(/^\d{10}$/).required(),
  password: Joi.string().min(4).optional() 
});

/** --- Generic User Edit Schema --- */
const editUserSchema = Joi.object({
  name: Joi.string().optional(),
  mobile_number: Joi.string().pattern(/^\d{10}$/).optional(),
  password: Joi.string().min(4).optional(),
  role: Joi.string().valid('admin', 'manufacturer', 'camp_lead', 'auditor', 'farmer').optional()
}).min(1).messages({
  'object.min': 'At least one field (name, mobile_number, or password) must be provided'
});




module.exports = {
    createUserSchema,
    editCampLeadSchema,
    editManufacturerSchema,
    editUserSchema
}