const express = require('express');

const {authorize} = require('../../middlewares');
const manufactureController = require("../../controllers/manufactureController");
const { validationMiddleware }  = require("../../middlewares");
const {createBatchSchema} = require("../../validations/batchSchema");

const router = express.Router();

router.post('/batches',[authorize(['manufacturer']), validationMiddleware(createBatchSchema)], manufactureController.createBatch);
router.get('/batches', [authorize(['manufacturer'])],manufactureController.getBatches);
router.get('/batches/:batch_id', [authorize(['manufacturer'])], manufactureController.getBatchDetails);
router.get('/delivery-details', [authorize(['manufacturer'])], manufactureController.getDeliveryDetails);




module.exports = router;