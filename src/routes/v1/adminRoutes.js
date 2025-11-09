const express = require('express');

const adminController = require("../../controllers/adminController");
const manfController = require("../../controllers/manufactureController");
const { authorize, authenticate, validationMiddleware }  = require("../../middlewares");

const { createUserSchema, editCampLeadSchema, editManufacturerSchema, editUserSchema } = require("../../validations/userSchema");

const router = express.Router();

router.get('/users', [authorize(['admin'])], adminController.getUsers);
router.post('/users', [authorize(['admin']), validationMiddleware(createUserSchema)], adminController.createUser);
router.get('/users/manufacturers', [authorize(['admin'])], adminController.getManufacturers);

//Dashboard Landing page
router.get('/dashboard', [authorize(['admin'])], adminController.getDashBoardDetails);
router.get('/dashboard/weekly-offsets', [authorize(['admin'])], adminController.getWeeklyOffsets);
router.get('/dashboard/farmer-onboarding', [authorize(['admin'])], adminController.getFarmersByMonth);
router.get('/dashboard/potential-offset', [authorize(['admin'])], adminController.getPotentialOffsets);

//Offset ledger
router.get('/dashboard/offsets', [authorize(['admin'])], adminController.getAllOffsets);
router.get('/dashboard/offsets/:offset_id/fractional-offsets', [authorize(['admin'])], adminController.getFractionalOffsetById);
router.get('/dashboard/offsets/:offset_id/fractional-offsets/export', [authorize(['admin'])], adminController.exportFractionalOffsetId);
router.get('/dashboard/farmers/export', [authorize(['admin'])], adminController.exportFarmers);
router.get('/dashboard/campleads/export', [authorize(['admin'])], adminController.exportCampleads);


//User Management
router.get('/users/manufacturers/details', [authorize(['admin'])], manfController.getAllManufacturers);
router.get('/users/campleads/details', [authorize(['admin'])], adminController.getAllCampLeads);
router.put('/users/manufacturers/:manufacturer_id', [authorize(['admin']), validationMiddleware(editManufacturerSchema)], manfController.updateManufacturer);
router.put('/users/campleads/:camplead_id/', [authorize(['admin']), validationMiddleware(editCampLeadSchema)], adminController.updateCamplead);
router.put('/users/:user_id', [authorize(['admin']), validationMiddleware(editUserSchema)], adminController.updateUser);











module.exports = router;
