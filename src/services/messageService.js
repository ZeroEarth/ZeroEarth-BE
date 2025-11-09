const { MessageRepository } = require("../repositories");
const CustomError = require("../utils/customError")

class MessageService {
    constructor() {
        this.messageRepository = new MessageRepository();
    }

    async getCommunityMessages(queryParams, communityId, farmerId) {
        try {
            const page = parseInt(queryParams.page, 10) || 1;
            const limit = parseInt(queryParams.limit, 10) || 50;
            const offset = (page - 1) * limit;

            const messages = await this.messageRepository.getMessagesByCommunity(communityId, limit, offset);
            const totalCount = await this.messageRepository.countMessagesByCommunity(communityId);

            // const enrichedMessages = await Promise.all(messages.map(async (msg) => {
            //     if (['feed_distribution', 'daily_feed'].includes(msg.type)) {
            //         const isResponded = await this.messageRepository.checkIfFarmerResponded(msg.id, farmerId, msg.type);
            //         return { ...msg, is_responded: isResponded };
            //     }
            //     return { ...msg};
            // }));
            
            return {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                messages: messages
            };

        } catch (error) {
            console.error("Error getting community messages:", error);
            throw error;
        }
    }

    async getLatestDailyFeedMessage(communityId, farmerId) {
        try {
            const message = await this.messageRepository.getLatestDailyFeedMessage(communityId);

            if( !message ) 
                return { daily_feed_message: null }

            const isResponded = await this.messageRepository.checkIfFarmerResponded(message.id, farmerId, 'daily_feed');         
            return {
                daily_feed_message: {...message, is_responded: !!isResponded}
            };

        } catch (error) {
            console.error("Error getting latest daily feed message:", error);
            throw error;
        }
    }

    // async sendFeedDistributionMessage(client, data) {
    //     try {
    //         const { community_id, type, message, sender_id, sender_type } = data;
    //         const msg = {
    //             community_id,
    //             type,
    //             sender_id,
    //             sender_type,
    //             message: JSON.stringify(message)
    //         };
    //         const saved = await this.insertMessages(client, msg);
    //         return saved;

    //     } catch (error) {
    //         console.log("Something went wrong at service layer");
    //         throw error;
    //     }
    // }

    async insertMessages(client, msg) {
        try {
            const savedMessage = await this.messageRepository.insertMessage(client,msg);
            return savedMessage;
        } catch(error) {
            console.error("Error inserting message:", error);
            throw error;
        }
    }

    async updateFarmerResponse(client, data) {
        try {
            const { community_id, message_id, type, message, sender_id, sender_type } = data;
            const msg = {
                community_id,
                type,
                sender_id,
                sender_type,
                message: JSON.stringify(message)
            };
            
            const savedMessage = await this.insertMessages(client, msg);
            const newMessageId = savedMessage.id;

            if (type === 'daily_feed_response') {
                await this.messageRepository.insertDailyFeedConfirmation(client, {
                    message_id: parseInt(message_id),
                    farmer_id: sender_id,
                });
            } else if (type === 'feed_receipt') {
                await this.messageRepository.insertFeedReceiptConfirmation(client, {
                    message_id: parseInt(message_id),
                    farmer_id: sender_id,
                    batch_no: message?.batch_no || "",
                    lat: message?.lat || "",
                    lng: message?.lng || ""
                });
            } else {
                throw new CustomError('Invalid message type', 400)
            }

            return savedMessage;
            
        } catch(error) {
            console.error("Error updating farmer response:", error);
            throw error;
        }
    }
}

module.exports = MessageService;