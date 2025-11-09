const bcrypt = require('bcrypt');

const { SALT_ROUNDS, DEFAULT_PASSWORD} = require("../config/serverConfig");
const { CommunityMgtRepository, MessageRepository } = require("../repositories");
const CustomError = require("../utils/customError");

class CommunityMgtService {
    constructor() {
        this.communityMgtRepository = new CommunityMgtRepository();
        this.messageRepository = new MessageRepository();
    }

    getCleanedFarmerData(data, communityId) {
        const { name, mobile_number, profile_pic, cattle_count, place, state, district, pincode, lat, lng, aadhar } = data;
        return {
            name: name.trim(),
            mobile_number: mobile_number.trim(),
            profile_pic: profile_pic?.trim() || null,
            cattle_count: parseInt(cattle_count) || 0,
            community_id: communityId,
            place: place || null,
            lat: lat || null,
            lng: lng || null,
            state: state || null,
            district: district || null,
            pincode: pincode || null,
            aadhar: aadhar || null
        };
    }

    async onboardFarmer(client, data, communityId, campLeadId) {
        try {

            const cleanedData = this.getCleanedFarmerData(data, communityId);

            const existingFarmer = await this.communityMgtRepository.getFarmerByMobile(client, cleanedData.mobile_number, communityId);
            if (existingFarmer) {
                throw new CustomError("A farmer with this mobile number already exists in the community", 409);
            }

            const farmer = await this.communityMgtRepository.onboardFarmer(client, cleanedData);

            const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

            await this.communityMgtRepository.createUserForFarmer(client, {
                mobile_number: farmer.mobile_number,
                password: hashedPassword,
                role: "farmer",
                ref_id: farmer.id
            });

            return farmer

        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    async getFarmers(client, communityId, queryParams) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.communityMgtRepository.countFarmersByCommunity(communityId);
            const farmers = await this.communityMgtRepository.getFarmers(client, communityId, limit, offset);

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                farmers
            };
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    async updateFarmer(client, farmerId, data, { isCampLead = false, campLeadId = null } = {}) {
        try {
            const cleanedData = this.getCleanedFarmerData(data);
    
            // 1. Get existing farmer
            const existingFarmer = await this.communityMgtRepository.getFarmerById(client, farmerId);
            if (!existingFarmer) {
                throw new CustomError("Farmer not found", 404);
            }
    
            // 2. Check mobile uniqueness (excluding self)
            if (cleanedData.mobile_number) {
                const existingUser = await this.communityMgtRepository.getUserByMobile(client, cleanedData.mobile_number);
                if (existingUser && existingUser.ref_id != farmerId) {
                    throw new CustomError("Mobile number already in use", 409);
                }
            }
    
            // 3. Update farmers table
            const updatedFarmer = await this.communityMgtRepository.updateFarmer(client, farmerId, cleanedData);
    
            // 4. Update users table
            await this.communityMgtRepository.updateUserByRefId(client, farmerId, cleanedData.mobile_number);
    
            if (isCampLead && campLeadId) {
                await this.communityMgtRepository.updateCampLead(client, campLeadId, cleanedData);
            }
    
            return updatedFarmer;
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    // async getPendingVerifications(queryParams, communityId) {
    //     try {
    //         const page = parseInt(queryParams.page, 10) || 1;
    //         const limit = parseInt(queryParams.limit, 10) || 50;
    //         const offset = (page - 1) * limit;

    //         const totalCount = await this.communityMgtRepository.countFarmersByCommunity(communityId);
    //         const offset_verifications = await this.communityMgtRepository.getOffsetVerificationList(
    //             parseInt(communityId),
    //             limit,
    //             offset
    //         );

    //         return {
    //             page,
    //             limit,
    //             totalCount,
    //             totalPages: Math.ceil(totalCount / limit),
    //             offset_verifications
    //         };

    //     } catch (error) {
    //         console.log("Something went wrong at service layer");
    //         throw error;
    //     }
    // }

    // async confirmOffsetVerification(client, data) {
    //     try {

    //         const { farmer_id, cattle_count, note, lat, lng, community_id } = data;

    //         console.log("======confirmOffsetVerification", data);

    //         const dateRec = await this.communityMgtRepository.getOffsetVerificationStartDate(farmer_id);

    //         const today = new Date();
    //         const dateStart = new Date(dateRec?.start_date);
            
    //         const isSameDate =
    //             today.getUTCFullYear() === dateStart.getUTCFullYear() &&
    //             today.getUTCMonth() === dateStart.getUTCMonth() &&
    //             today.getUTCDate() === dateStart.getUTCDate();

    //         if (isSameDate) {
    //             throw new CustomError("Offset verification already confirmed for today for this farmer", 400);
    //         }

    //         const latestBatch = await this.communityMgtRepository.getLatestBatchNoForFarmer(client, farmer_id);

    //         if (!latestBatch) {
    //             throw new CustomError("No feed batch received confirmation exists for this farmer", 400);
    //         }

    //         const daysDiff = Math.ceil((today - dateStart) / (1000 * 60 * 60 * 24)) || 1;

    //         const campVisit = await this.communityMgtRepository.upsertCampLeadVisit(
    //             client,
    //             {
    //                 farmer_id,
    //                 community_id,
    //                 note,
    //                 lat,
    //                 lng,
    //                 date_of_visit: today,
    //             }
    //         );

    //         const offsetRecords = [];


    //         for (let i = 0; i < daysDiff; i++) {
    //             const offsetDate = new Date(dateStart);
    //             offsetDate.setDate(offsetDate.getDate() + i);
          
    //             const batch = await this.communityMgtRepository.getBatchNoForFarmerOnOrBeforeDate(
    //                 client,
    //                 farmer_id,
    //                 offsetDate
    //             );
                        
    //             for (let cowIndex = 1; cowIndex <= cattle_count; cowIndex++) {
    //                 const cow_id = `${farmer_id}/${cowIndex}`;
            
    //                 offsetRecords.push({
    //                     farmer_id,
    //                     cow_id,
    //                     camp_lead_verification_id: campVisit.id,
    //                     lat,
    //                     lng,
    //                     batch_no: batch?.batch_no || "",
    //                     offset_value: 1 / 365,
    //                     offset_id: null,
    //                     log_date: offsetDate,
    //                 });
    //             }
    //         }
          
    //         if (offsetRecords.length) {
    //             await this.communityMgtRepository.insertFractionalOffsets(
    //                 client,
    //                 offsetRecords
    //             );
    //         }

    //         return campVisit


    //     } catch (error) {
    //         console.log("Something went wrong at service layer");
    //         throw error;
    //     }
    // }

    async getLatestBatchDetailsAssigned(campLeadId) {
        try {
            const res = await this.communityMgtRepository.getLatestBatchDetailsAssigned(campLeadId);
            return res;
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    async verifyBatchAssigned(batchId, campLeadId) {
        try {
            const res = await this.communityMgtRepository.verifyBatchAssigned(batchId, campLeadId);
            if (res)
                return {
                    verified: res
                };
            throw new CustomError("Batch verification failed", 400);
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    async getFarmersByCommunityWithBatchConfirmation(communityId, batchNo) {
        try {
            const res = await this.communityMgtRepository.getFarmersByCommunityWithBatchConfirmation(communityId, batchNo);
            return res;
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }
    async sendFeedDistribution(communityId, farmerId, campLeadId, data) {
        try {
            const res = await this.communityMgtRepository.sendFeedDistribution(communityId, farmerId,campLeadId, data);
            return res;
        } catch (error) {
            console.error("Error in community management service:", error);
            throw error;
        }
    }

    async getFarmersListForFeedDistribution(communityId, batchNo) {
        try {
            return await this.communityMgtRepository.getFarmersListForFeedDistribution(communityId, batchNo);
        } catch (error) {
            console.error("Error at service layer:", error);
            throw error;
        }
    }

    async getLatestFeedDistribution(farmerId, campLeadId) {
        try {
            const res = await this.communityMgtRepository.getLatestFeedDistribution(farmerId, campLeadId);
            if (res)
                return res
            throw new CustomError("No feed distribution available", 404);
        } catch (error) {
            console.error("Error at service layer:", error);
            throw error;
        }
    }

    async confirmFeedDistribution(client, communityId, farmerId, batchNo, lat, lng) {
        try {
            const response = await this.communityMgtRepository.confirmFeedDistribution(client, farmerId, batchNo, lat, lng);
            const data = {
                lat,
                lng,
                batch_no: batchNo
            }

            const message = {
                community_id: communityId,
                type: "feed_receipt",
                sender_id: farmerId,
                sender_type: 'farmer',
                message: data
            }

            await this.messageRepository.insertMessage(client, message);
            return response;

        } catch (error) {
            console.error("Error at service layer:", error);
            throw error;
        }
    }
    
}

module.exports = CommunityMgtService;