const {AuthService} = require('../services');
const withTransaction = require('../utils/withTransaction');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const authService = new AuthService();

const login = async (req, res) => {
  try {
    const response = await authService.login(req.body);
    return sendSuccessResponse(res, response, "Login successful", 200);
  } catch (error) {
    return sendErrorResponse(res, error, "Login Failed");
  }
  
};

const updateTermsWithLocation = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const campLeadId = req.user.camp_lead_id;
    const role = req.user.role;
    const { lat, lng } = req.body;

    const response = await withTransaction(async (client) => {
        return await authService.updateTermsWithLocation(client, {
            farmerId,
            campLeadId,
            role,
            lat,
            lng,
        });
    })
    return sendSuccessResponse(res, response, "Successfully verified farmer offsets", 200);
  } catch (error) {
      return sendErrorResponse(res, error, "Failed to verify farmer offset");
  }

}

module.exports = {
    login,
    updateTermsWithLocation
}