const { CommunityMgtRepository } = require("../repositories");
const CustomError = require("../utils/customError");
const { sendErrorResponse } = require('../utils/common');

const communityRepo = new CommunityMgtRepository();


const validateUserCommunityAccess = async (req, res, next) => {
    const communityId = req.params.community_id;
    const userId = req.user.id;
    const role = req.user.role;
  
    try {
      const community = await communityRepo.getCommunityById(communityId);
      if (!community) {
        const error = new Error('Community does not exist');
        error.statusCode = 404;
        return sendErrorResponse(res, error, 'Unauthorized');
      }
  
      let belongs = false;
  
      // if (role === 'camp_lead') {
      //   belongs = await communityRepo.doesCampLeadBelongToCommunity(userId, communityId);
      // } else if (role === 'farmer') {
      //   belongs = await communityRepo.doesFarmerBelongToCommunity(userId, communityId);
      // }

      belongs = await communityRepo.doesFarmerBelongToCommunity(userId, communityId);
  
      if (!belongs) {
        const error = new Error("Unauthorized: User doesn't belong to this community");
        error.statusCode = 403;
        return sendErrorResponse(res, error, 'Unauthorized');
      }
  
      next();
    } catch (err) {
      next(err);
    }
  };

  module.exports = validateUserCommunityAccess;



