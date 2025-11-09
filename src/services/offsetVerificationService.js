const { OffsetVerificationRepository, CommunityMgtRepository } = require("../repositories");
const CustomError = require("../utils/customError")

class OffsetVerificationService {
    constructor() {
        this.offsetRepository = new OffsetVerificationRepository();
        this.communityMgtRepository = new CommunityMgtRepository()
    }

    async getOffsetVerificationList(farmerId) {
        try {
            return await this.offsetRepository.getOffsetVerificationList(farmerId);
        } catch (error) {
            console.error("Error at service layer:", error);
            throw error;
        }
    }

    async getFarmersListForOffsetVerification(queryParams, communityId) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const totalCount = await this.communityMgtRepository.countFarmersByCommunity(communityId);
            const offset_verifications = await this.offsetRepository.getFarmersListForOffsetVerification(
                parseInt(communityId),
                limit,
                offset
            );

            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                offset_verifications
            };

        } catch (error) {
            console.error("Error getting farmers list for offset verification:", error);
            throw error;
        }
    }

    async confirmOffsetVerification(client, data, fractional_offsets) {
        try {

            const {verified_lat, verified_lng ,verification_pic, farmer_id,
                community_id, note } = data;

            const today = new Date();
            const campVisit = await this.offsetRepository.upsertCampLeadVisit(
                client,
                {
                    farmer_id,
                    community_id,
                    verified_lat,
                    verified_lng,
                    date_of_visit: today,
                }
            );

            await this.offsetRepository.bulkInsertFractionalOffsets(client, fractional_offsets, verified_lat, verified_lng, verification_pic);
            await this.offsetRepository.finalizeOffsets(client);

            return campVisit;
        } catch (error) {
            console.error("Error confirming offset verification:", error);
            throw error;
        }
    }
}

module.exports = OffsetVerificationService;