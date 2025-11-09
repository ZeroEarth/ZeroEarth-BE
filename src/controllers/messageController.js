const { MessageService } = require('../services');
const withTransaction = require('../utils/withTransaction');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/common');

const messageService = new MessageService();

const getCommunityMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await messageService.getCommunityMessages(req.query, req.params.community_id, userId);
        sendSuccessResponse(res, response, "Successfully fetched community messages", 200);
    } catch (error) {
            return sendErrorResponse(res, error, "Failed to fetch community messages");
    }
  
};

const getLatestDailyFeedMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await messageService.getLatestDailyFeedMessage(req.params.community_id, userId);
        sendSuccessResponse(res, response, "Successfully fetched latest daily feed message", 200);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to fetch latest daily feed message");
    }
  
};

// const sendFeedDistributionMessage = async (req, res) => {
//     try {
//         const { community_id } = req.params;
//         const { type, message } = req.body;
//         const sender_id = req.user.id;
//         const sender_type = req.user.role;

//         const response = await withTransaction(async (client) => {
//             return await messageService.sendFeedDistributionMessage(client, {
//                 community_id: parseInt(community_id),
//                 type,
//                 message,
//                 sender_id,
//                 sender_type
//             });
//         })

//         return sendSuccessResponse(res, response, "Successfully send feed distribution message", 201);
//     } catch (error) {
//         return sendErrorResponse(res, error, "Failed to send feed distribution message");
//     }
// };

const updateFarmerResponse = async (req, res) => {
    try {
        const { community_id, message_id } = req.params;
        const { type, message } = req.body;
        const sender_id = req.user.id;
        const sender_type = req.user.role;

        const response = await withTransaction(async (client) => {
            return await messageService.updateFarmerResponse(client, {
                community_id: parseInt(community_id),
                message_id: parseInt(message_id),
                type,
                message,
                sender_id,
                sender_type
            });
        })
        return sendSuccessResponse(res, response, "Successfully inserted farmer response", 201);
    } catch (error) {
        return sendErrorResponse(res, error, "Failed to insert farmer response");
    }
    
};

module.exports = {
    getCommunityMessages,
    getLatestDailyFeedMessage,
    // sendFeedDistributionMessage,
    updateFarmerResponse
}