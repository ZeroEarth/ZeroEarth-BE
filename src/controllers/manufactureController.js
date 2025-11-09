const {ManufactureService} = require('../services');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');
const withTransaction = require('../utils/withTransaction');


const manufactureService = new ManufactureService();

const getBatches = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;   
        const response = await manufactureService.getBatches(req.query, manufacturer_id);
        return sendSuccessResponse(res, response, "Batch history fetched successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch batch history");
    }
    
};

const getBatchDetails = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;
        const { batch_id } = req.params;    
        const response = await manufactureService.getBatchDetails(req.query, manufacturer_id, batch_id);
        return sendSuccessResponse(res, response, "Batch details fetched successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch batch history");
    }
};

const createBatch = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;   
        const response = await withTransaction(async (client) => {
            return await manufactureService.createBatch(client, {
                manufacture_id: parseInt(manufacturer_id),
                ...req.body
            });
        })
        return sendSuccessResponse(res, response, "Batch created successfully", 201);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to create batch");
    }
    
};

const getDeliveryDetails = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;
        const response = await manufactureService.getDeliveryDetails(req.query, manufacturer_id);
        return sendSuccessResponse(res, response, "Delivery details fetched successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch delivery details");
    }
};

const getAllManufacturers = async (req, res) => {
    try {
        const response = await manufactureService.getAllManufacturers(req.query);
        return sendSuccessResponse(res, response, "Manufacturers fetched successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch manufactures");
    }
};

const updateManufacturer = async (req, res) => {
    try {
        const { manufacturer_id } = req.params; 
        const response = await withTransaction(async (client) => {
            return await manufactureService.updateManufactureId(client, {
                manufacturer_id: parseInt(manufacturer_id),
                ...req.body
            });
        })
        return sendSuccessResponse(res, response, "Manufacturer updated successfully", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to update manufacture");
    }
};

module.exports = {
    createBatch,
    getBatches,
    getBatchDetails,
    getDeliveryDetails,
    getAllManufacturers,
    updateManufacturer
}