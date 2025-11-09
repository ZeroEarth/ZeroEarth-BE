const { CommunityMgtService, OffsetVerificationService } = require('../services');
const withTransaction = require('../utils/withTransaction');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const communityMgtService = new CommunityMgtService();
const offsetVericationService = new OffsetVerificationService();

const onboardFarmer = async (req, res) => {
  try {
    const response = await withTransaction(async (client) => {
      return await communityMgtService.onboardFarmer(client, req.body, req.params.community_id, req.user.id);
    })
    return sendSuccessResponse(res, response, "Farmer onboarded successfully", 201);
  } catch (error) {
    return sendErrorResponse(res, error, "Farmer onboarding failed");
  }
  
};

const getFarmers = async (req, res) => {
  try {
    const { community_id } = req.params;
    const response = await withTransaction(async (client) => {
      return await communityMgtService.getFarmers(client, community_id, req.query);
    })
    return sendSuccessResponse(res, response, "Farmers fetched successfully", 200);
  } catch (error) {
    return sendErrorResponse(res, error, "Farmers fetching failed");
  }
};

const updateFarmer = async (req, res) => {
  try {
    const campLeadId = req.user.camp_lead_id;
    const userId = req.user.id;
    const role = req.user.role;
    const { community_id, farmer_id } = req.params;

    const response = await withTransaction(async (client) => {
      return await communityMgtService.updateFarmer(
        client, 
        farmer_id, 
        req.body,
        { isCampLead: role === "camp_lead" && userId == farmer_id, campLeadId }
      );
    })
    return sendSuccessResponse(res, response, "Farmer updated successfully", 200);
  } catch (error) {
    return sendErrorResponse(res, error, "Farmer updation failed");
  }
};

const getFarmersListForOffsetVerification = async (req, res) => {
  try {
    const response = await offsetVericationService.getFarmersListForOffsetVerification(req.query, req.params.community_id, req.user.id);
    return sendSuccessResponse(res, response, "Successfully fetched farmers list for offset verification", 200);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch offset verification farmers list");
  }
}

// const confirmOffsetVerification = async (req, res) => {
//   try {
//     const { community_id } = req.params;
//     const { farmer_id, cattle_count, lat, lng, note } = req.body;

//     const response = await withTransaction(async (client) => {
//         return await communityMgtService.confirmOffsetVerification(client, {
//             community_id: parseInt(community_id),
//             farmer_id,
//             cattle_count,
//             lat,
//             lng,
//             note,
//         });
//     })
//     return sendSuccessResponse(res, response, "Successfully verified farmer offsets", 200);
//   } catch (error) {
//       return sendErrorResponse(res, error, "Failed to verify farmer offset");
//   }

// }

const getLatestBatchDetailsAssigned = async (req, res) => {
  try {
    const campLeadId = req.user.camp_lead_id;

    const response = await communityMgtService.getLatestBatchDetailsAssigned(campLeadId);
    return sendSuccessResponse(res, response, "Successfully fetched latest batch details of camplead", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch latest batch details of camplead");
  }
}

const verifyBatchAssigned = async (req, res) => {
  try {
    const campLeadId = req.user.camp_lead_id;
    const { batch_id } = req.params;

    const response = await communityMgtService.verifyBatchAssigned(batch_id, campLeadId);
    return sendSuccessResponse(res, response, "Successfully verified batch assigned", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to verify batch assigned");
  }
}

const getFarmersByCommunityWithBatchConfirmation = async (req, res) => {
  try {
    const { community_id, batch_no } = req.params;

    const response = await communityMgtService.getFarmersByCommunityWithBatchConfirmation(community_id, batch_no);
    return sendSuccessResponse(res, response, "Successfully fetched all farmers under community", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch all farmers under community");
  }
}

const sendFeedDistribution = async (req, res) => {
  try {
    const campLeadId = req.user.camp_lead_id;
    const { community_id, farmer_id } = req.params;

    const response = await communityMgtService.sendFeedDistribution(community_id, farmer_id, campLeadId, req.body);
    return sendSuccessResponse(res, response, "Successfully send feed distribution", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to send feed distribution");
  }
}

const getFarmersListForFeedDistribution = async (req, res) => {
  try {

      const { community_id, batch_no } = req.params;

      const decodedBatchNo = decodeURIComponent(batch_no);
      const farmers = await communityMgtService.getFarmersListForFeedDistribution(community_id, decodedBatchNo);

      return sendSuccessResponse(
          res,
          farmers,
          "Successfully fetched farmers list",
          200
      );
  } catch (error) {
      console.log()
      return sendErrorResponse(res, error, "Failed to fetch farmers list");
  }
};

const getLatestFeedDistribution = async (req, res) => {
  try {
      const farmerId = req.user.id
      const campLeadId = req.user.camp_lead_id;

      const latestDistribution = await communityMgtService.getLatestFeedDistribution(farmerId, campLeadId);

      return sendSuccessResponse(
          res,
          latestDistribution,
          "Successfully fetched latest feed distribution",
          200
      );
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to fetch latest feed distribution");
  }
};

const confirmFeedDistribution = async (req, res) => {
  try {
      const farmerId= req.user.id;
      const { community_id } = req.params
      const { batch_no, lat, lng } = req.body;

      const response = await withTransaction(async (client) => {
        return await communityMgtService.confirmFeedDistribution(
          client,
          community_id,
          farmerId,
          batch_no,
          lat || null,
          lng || null
        );
      })

      return sendSuccessResponse(
          res,
          response,
          "Feed distribution confirmed successfully",
          201
      );
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to confirm feed distribution");
  }
};

module.exports = {
    onboardFarmer,
    getFarmers,
    updateFarmer,
    getFarmersListForOffsetVerification,
    // confirmOffsetVerification,
    getLatestBatchDetailsAssigned,
    verifyBatchAssigned,
    getFarmersByCommunityWithBatchConfirmation,
    sendFeedDistribution,
    getFarmersListForFeedDistribution,
    getLatestFeedDistribution,
    confirmFeedDistribution
}