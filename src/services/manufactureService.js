const { ManufactureRepository } = require("../repositories");
const CustomError = require("../utils/customError");
const { v4: uuidv4 } = require("uuid");
const { SALT_ROUNDS } = require("../config/serverConfig");



class ManufactureService {
    constructor() {
        this.manufactureRepository = new ManufactureRepository();
    }

    getCleanedBatchData(data) {
        const { date_of_manufacturing, quantity, manufacture_id } = data;
        return {
            date_of_manufacturing,
            quantity,
            manufacture_id,
        };
    }

    formatBatchNo = (batchId, manufacturingDate) => {
        const date = new Date(manufacturingDate);
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 01-12
        const yy = String(date.getFullYear()).slice(-2);        // last two digits of year
        const paddedId = String(batchId).padStart(2, '0');      // id padded to 2 digits
        return `ZEC_MCC_B${mm}${yy}/${paddedId}`;
    };

    getTempBatchNo = (manufacturingDate) => {
        const date = new Date(manufacturingDate);
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 01-12
        const yy = String(date.getFullYear()).slice(-2);        // last two digits of year
        const paddedId = `${uuidv4().split('-')[0].toUpperCase()}`; 
        return `ZEC_MCC_B${mm}${yy}/${paddedId}`;
    };
      

    async createBatch(client, data) {
        try {

            const cleanedData = this.getCleanedBatchData(data);

            const tempBatchNo = this.getTempBatchNo(cleanedData.date_of_manufacturing);

            const newBatch = await this.manufactureRepository.insertBatch(client, {
                batch_no: tempBatchNo,
                ...cleanedData
            });

            const formattedBatchNo = this.formatBatchNo(newBatch.id, cleanedData.date_of_manufacturing);
            
            const updatedBatch = await this.manufactureRepository.updateBatchNo(client, newBatch.id, formattedBatchNo);

            const campLeads = await this.manufactureRepository.getCampLeadsByManufacturer(client, cleanedData.manufacture_id);
            if (campLeads.length > 0) {
                const ackList = campLeads.map((lead) => ({
                    batch_id: updatedBatch.id,
                    camp_lead_id: lead.id,
                    acknowledged: false
                }));
        
                await this.manufactureRepository.insertBatchAcknowledgements(client, ackList);
            }

            return updatedBatch;
        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

    async getBatches(queryParams, manufactureId) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.manufactureRepository.countBatchesByManufacture(manufactureId);
            const batches = await this.manufactureRepository.getAllBatches(
                parseInt(manufactureId),
                limit,
                offset
            );

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                batches
            };
            

        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

    async getBatchDetails(queryParams, manufactureId, batchId) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.manufactureRepository.countCampleadsUnderManufacture(manufactureId);
            const batchDetails = await this.manufactureRepository.getBatchDetail(batchId, manufactureId);
            const campLeads = batchDetails 
                ? await this.manufactureRepository.getCampleadsAcks(
                    batchId, 
                    manufactureId,
                    limit,
                    offset
                )
                : [];


            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                batch: batchDetails || null,
                camp_leads: campLeads
            };
            

        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

    async getDeliveryDetails(queryParams, manufactureId) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.manufactureRepository.countCampleadsUnderManufacturer(manufactureId);
            const delivery_details = await this.manufactureRepository.getDeliveryDetails(
                parseInt(manufactureId),
                limit,
                offset
            );

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                delivery_details
            };
            

        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

    async getAllManufacturers(queryParams) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.manufactureRepository.countManufacturers();
            const manufacturers = await this.manufactureRepository.getAllManufacturers(
                limit,
                offset
            );

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                manufacturers
            };
            
        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

    async updateManufactureId(client, payload) {
        try {
            const { manufacturer_id, password, mobile_number, ...manufacturerData } = payload;
            const updatedManufacturer = await this.manufactureRepository.updateManufacturer(
                client,
                manufacturer_id,
                manufacturerData
            );

            const userUpdateData = {};
            if (mobile_number) {
                const existingUser = await this.manufactureRepository.findUserByMobile(client, mobile_number);
                if (existingUser && existingUser.ref_id !== manufacturer_id) {
                    throw new Error("Mobile number already exists. Please use a different one.");
                }
                userUpdateData.mobile_number = mobile_number;
            } 
            if (password) userUpdateData.password = await bcrypt.hash(password, SALT_ROUNDS);
            if (Object.keys(userUpdateData).length > 0) {
                await this.manufactureRepository.updateUserByRefId(client, manufacturer_id, userUpdateData);
            }
    
            return updatedManufacturer;
        } catch (error) {
            console.error("Error in manufacture service:", error);
            throw error;
        }
    }

}

module.exports = ManufactureService;