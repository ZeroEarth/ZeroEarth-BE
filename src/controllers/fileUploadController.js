const {FileUploadService} = require('../services');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const fileUploadService = new FileUploadService();

const generateUploadUrl = async (req, res) => {
  try {
    const fileName = req.body?.file_name;
    const response = await fileUploadService.generateUploadUrl(fileName);
    return sendSuccessResponse(res, response, "Successfully generated upload url", 200);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to generate upload url");
  }
  
};

module.exports = {
    generateUploadUrl
}