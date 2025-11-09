const { OffsetVerificationService } = require('../services');
const withTransaction = require('../utils/withTransaction');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const offsetVerificationService = new OffsetVerificationService();


const getOffsetVerificationList = async (req, res) => {
  try {
      const { farmer_id } = req.params

      const latestDistribution = await offsetVerificationService.getOffsetVerificationList(farmer_id);

      return sendSuccessResponse(
          res,
          latestDistribution,
          "Successfully fetched farmer verification list",
          200
      );
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch farmer verification list");
  }
};

const confirmOffsetVerification = async (req, res) => {
    try {
      const { community_id, farmer_id } = req.params;
      const { verified_lat, verified_lng, verification_pic, fractional_offsets } = req.body;

      const data = {verified_lat, verified_lng, verification_pic, community_id, farmer_id};
  
      const response = await withTransaction(async (client) => {
          return await offsetVerificationService.confirmOffsetVerification(client, data, fractional_offsets);
      })
      return sendSuccessResponse(res, response, "Successfully verified farmer offsets", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to verify farmer offset");
    }
  
  }

module.exports = {
    getOffsetVerificationList,
    confirmOffsetVerification
}