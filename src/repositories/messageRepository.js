const db = require("../config/db");

const FARMER_TABLE = 'farmers';
const DAILY_FEED_CONFIRMATIONS_TABLE = 'daily_feed_confirmations';
const FEED_RECEIPT_CONFIRMATIONS_TABLE = "feed_receipt_confirmations";
const MESSAGES_TABLE = 'messages';

class MessageRepository {
    async getMessagesByCommunity(communityId, limit, offset) {

        const query = `
            SELECT 
                m.*, 
                f.name AS sender_name,
                f.profile_pic AS profile_pic
            FROM messages m
            LEFT JOIN farmers f ON m.sender_id = f.id
            WHERE m.community_id = $1
                AND m.type IN ('feed_receipt', 'daily_feed_response')
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3
        `
        const result = await db.query(query, [communityId, limit, offset]);
        return result.rows;
    }

    async countMessagesByCommunity(communityId) {
        const query = `
            SELECT COUNT(*) FROM ${MESSAGES_TABLE} AS m 
            WHERE community_id = $1
            AND m.type IN ('feed_receipt', 'daily_feed_response')
        `;
        const result = await db.query(query, [communityId]);
        return parseInt(result.rows[0].count, 10);
    }

    async getLatestDailyFeedMessage(communityId) {
        const query = `
            SELECT m.*
            FROM ${MESSAGES_TABLE} AS m
            WHERE community_id = $1
            AND type = 'daily_feed'
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await db.query(query, [communityId]);
        return result.rows[0] || null;
    }

    async checkIfFarmerResponded(messageId, farmerId, type) {
        let query = '';
        let values = [messageId, farmerId];

        if (type === 'feed_distribution') {
            query = `
                SELECT 1 FROM feed_receipt_confirmations
                WHERE message_id = $1 AND farmer_id = $2
                LIMIT 1
            `;
        } else if (type === 'daily_feed') {
            query = `
                SELECT 1 FROM daily_feed_confirmations
                WHERE message_id = $1 AND farmer_id = $2
                LIMIT 1
            `;
        } else {
            return false;
        }

        const result = await db.query(query, values);
        return result.rowCount > 0;
    }

    async insertMessage(client, msg) {
        const query = `
            INSERT INTO ${MESSAGES_TABLE} (community_id, type, sender_id, sender_type, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [
            msg.community_id,
            msg.type,
            msg.sender_id,
            msg.sender_type,
            msg.message
        ];

        const res = await client.query(query, values);
        return res.rows[0];
    }

    async insertDailyFeedConfirmation(client, { message_id, farmer_id }) {
        const query = `
            INSERT INTO ${DAILY_FEED_CONFIRMATIONS_TABLE} (message_id, farmer_id)
            VALUES ($1, $2)
        `;
        await client.query(query, [message_id, farmer_id]);
    }

    async insertFeedReceiptConfirmation(client, { message_id, farmer_id, batch_no, lat, lng }) {
        const query = `
            INSERT INTO ${FEED_RECEIPT_CONFIRMATIONS_TABLE} (message_id, farmer_id, batch_no, lat, lng)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(query, [message_id, farmer_id, batch_no, lat, lng]);
    }
}

module.exports = MessageRepository;