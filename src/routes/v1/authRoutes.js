const express = require('express');

const authController = require("../../controllers/authController");
const { authorize, authenticate, validationMiddleware }  = require("../../middlewares");

const {loginSchema, termsSchema} = require("../../validations/loginSchema");

const router = express.Router();

router.post('/login', [validationMiddleware(loginSchema)], authController.login);
router.put('/accept-terms-and-conditions', [authenticate,authorize(['farmer', 'camp_lead']), validationMiddleware(termsSchema)], authController.updateTermsWithLocation);

module.exports = router;