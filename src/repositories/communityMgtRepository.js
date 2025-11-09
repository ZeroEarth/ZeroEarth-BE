const db = require("../config/db");
const { customFarmerSubQuery } = require("../utils/constants");

const { FEED_DAYS, FEED_QUANTITY} = require("../config/serverConfig");


const FARMER_TABLE = 'farmers';
const USERS_TABLE = 'users'
const COMMUNITIES_TABLE = 'communities';
const CAMPLEADS_VISITS_TABLE = 'camp_lead_visits';
const FRACTIONAL_OFFSETS_TABLE = 'fractional_offsets';
const FEED_RECEIPT_CONFIRMATIONS_TABLE= 'feed_receipt_confirmations';

class CommunityMgtRepository {
    async onboardFarmer(client, data) {
        const { name, mobile_number, profile_pic, cattle_count, place, community_id, lat, lng, state, district, pincode, aadhar} = data;

        const query = `
            INSERT INTO ${FARMER_TABLE} (name, mobile_number, place, profile_pic, cattle_count, community_id, lat, lng, state, district, pincode, aadhar)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;

        const values = [name, mobile_number, place, profile_pic, cattle_count, community_id, lat, lng, state, district, pincode, aadhar];

        const result = await client.query(query, values);
        return result.rows[0];
    }

    async createUserForFarmer(client, { mobile_number, password, role, ref_id }) {
        const query = `
            INSERT INTO ${USERS_TABLE} (mobile_number, password, role, ref_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [mobile_number, password, role, ref_id];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async getFarmers(client, communityId, limit, offset) {
        const query = `
            SELECT *
            FROM ${FARMER_TABLE}
            WHERE community_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3;

        `;

        const result = await client.query(query, [communityId, limit, offset]);
        return result.rows;
    }

    async getFarmerById(client, farmerId) {
        const query = `SELECT * FROM ${FARMER_TABLE} WHERE id = $1`;
        const result = await client.query(query, [farmerId]);
        return result.rows[0];
    }
    
    async getUserByMobile(client, mobile_number) {
        const query = `SELECT * FROM users WHERE mobile_number = $1`;
        const result = await client.query(query, [mobile_number]);
        return result.rows[0];
    }

    async updateFarmer(client, farmerId, data) {
        const { name, mobile_number, profile_pic, cattle_count, place, state, district, pincode, aadhar } = data;
    
        const query = `
            UPDATE ${FARMER_TABLE}
            SET name = $1,
                mobile_number = $2,
                profile_pic = $3,
                cattle_count = $4,
                place = $5,
                state = $6,
                district = $7,
                pincode = $8,
                aadhar = $9
            WHERE id = $10
            RETURNING *;
        `;
    
        const values = [name, mobile_number, profile_pic, cattle_count, place, state, district, pincode, aadhar, farmerId];
    
        const result = await client.query(query, values);
        return result.rows[0];
    }
    
    async updateUserByRefId(client, farmerId, mobile_number) {
        const query = `
            UPDATE users
            SET mobile_number = $1
            WHERE ref_id = $2 AND role = 'farmer'
            RETURNING *;
        `;
        const result = await client.query(query, [mobile_number, farmerId]);
        return result.rows[0];
    }
    
    async updateCampLead(client, campLeadId, data) {
        const { name, mobile_number, profile_pic, place, state, district, pincode, aadhar } = data;
    
        const query = `
            UPDATE camp_leads
            SET name = $1,
                mobile_number = $2,
                profile_pic = $3,
                place = $4,
                state = $5,
                district = $6,
                pincode = $7,
                aadhar = $8
            WHERE id = $9
            RETURNING *;
        `;
    
        const values = [name, mobile_number, profile_pic, place, state, district, pincode, aadhar, campLeadId];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async getCommunityById(id) {
        const res = await db.query(`SELECT id FROM ${COMMUNITIES_TABLE} WHERE id = $1`, [id]);
        return res.rows[0];
    }

    async doesCampLeadBelongToCommunity(campLeadId, communityId) {
        const res = await db.query(
            `SELECT 1 FROM ${COMMUNITIES_TABLE} WHERE id = $1 AND camp_lead_id = $2`,
            [communityId, campLeadId]
        );
        return res.rowCount > 0;
    }

    async doesFarmerBelongToCommunity(farmerId, communityId) {
        const res = await db.query(
          `SELECT 1 FROM ${FARMER_TABLE} WHERE id = $1 AND community_id = $2`,
          [farmerId, communityId]
        );
        return res.rowCount > 0;
      }

    async getFarmerByMobile(client, mobileNumber, communityId) {
        const result = await client.query(
            `SELECT * FROM ${FARMER_TABLE} WHERE mobile_number = $1 AND community_id = $2 LIMIT 1`,
            [mobileNumber, communityId]
        );
        return result.rows[0];
    }

    // async getOffsetVerificationList(communityId, limit, offset) {
    //     const query = `
    //         SELECT 
    //             f.id AS farmer_id,
    //             f.name AS farmer_name,
    //             f.profile_pic,
    //             f.cattle_count,
    //             f.place,
    //             f.created_at AS onboarded_date,
    //             COALESCE(visits.latest_visit, NULL) AS last_verified,
    //             EXTRACT(DAY FROM (CURRENT_DATE - COALESCE(visits.latest_visit, f.created_at)))::int AS days_pending,
    //             loc.lat,
    //             loc.lng,
    //             batch.batch_no AS latest_batch
    //         FROM ${FARMER_TABLE} f
    //         LEFT JOIN (
    //             SELECT farmer_id, MAX(date_of_visit) AS latest_visit
    //             FROM ${CAMPLEADS_VISITS_TABLE}
    //             GROUP BY farmer_id
    //         ) visits ON f.id = visits.farmer_id
    //         LEFT JOIN LATERAL (
    //             SELECT lat, lng
    //             FROM ${CAMPLEADS_VISITS_TABLE}
    //             WHERE farmer_id = f.id
    //             ORDER BY date_of_visit DESC
    //             LIMIT 1
    //         ) loc ON true
    //         LEFT JOIN LATERAL (
    //             SELECT batch_no
    //             FROM ${FEED_RECEIPT_CONFIRMATIONS_TABLE}
    //             WHERE farmer_id = f.id
    //             ORDER BY created_at DESC
    //             LIMIT 1
    //         ) batch ON true
    //         WHERE f.community_id = $1
    //         ORDER BY days_pending DESC
    //         LIMIT $2 OFFSET $3;
    //         `;

    //     const values = [communityId, limit, offset];
    //     const result = await db.query(query, values);

    //     return result.rows;
    // }

    async countFarmersByCommunity(communityId) {
        const query = `SELECT COUNT(*) FROM ${FARMER_TABLE} WHERE community_id = $1`;
        const result = await db.query(query, [communityId]);
        return parseInt(result.rows[0].count, 10);
    }

    // async getOffsetVerificationStartDate(farmerId) {
    //     const query =
    //     `
    //     SELECT 
    //         COALESCE(clv.date_of_visit, f.created_at) AS start_date
    //     FROM 
    //         ${FARMER_TABLE} f
    //     LEFT JOIN 
    //         ${CAMPLEADS_VISITS_TABLE} clv ON f.id = clv.farmer_id
    //     WHERE f.id = $1;
    //     `

    //     const values = [farmerId];
    //     const result = await db.query(query, values);
    //     return result.rows[0];
    // }

    // async upsertCampLeadVisit(client, data) {
    //     const query = `
    //     INSERT INTO ${CAMPLEADS_VISITS_TABLE} (community_id, farmer_id, note, date_of_visit, lat, lng)
    //     VALUES ($1, $2, $3, $4, $5, $6)
    //     ON CONFLICT (farmer_id)
    //     DO UPDATE SET
    //         community_id = EXCLUDED.community_id,
    //         date_of_visit = EXCLUDED.date_of_visit,
    //         note = EXCLUDED.note,
    //         lat = EXCLUDED.lat,
    //         lng = EXCLUDED.lng
    //     RETURNING *
    //     `
    //     const values = [
    //         data.community_id,
    //         data.farmer_id,
    //         data.note,
    //         data.date_of_visit,
    //         data.lat,
    //         data.lng
    //     ];

    //     const res = await client.query(query, values);
    //     return res.rows[0];
    // }

    // async getLatestBatchNoForFarmer(client, farmer_id) {
    //     const query = `
    //         SELECT batch_no FROM ${FEED_RECEIPT_CONFIRMATIONS_TABLE}
    //         WHERE farmer_id = $1
    //         ORDER BY created_at DESC
    //         LIMIT 1
    //     `;
    //     const values = [farmer_id];
    //     const res = await client.query(query, values);
    //     return res.rows[0] || null;
    // }

    // async getBatchNoForFarmerOnOrBeforeDate(client, farmer_id, date) {
    //     // Try to get batch_no on or before the date
    //     let query = `
    //       SELECT batch_no FROM ${FEED_RECEIPT_CONFIRMATIONS_TABLE}
    //       WHERE farmer_id = $1 AND created_at <= $2
    //       ORDER BY created_at DESC
    //       LIMIT 1
    //     `;
    //     let values = [farmer_id, date];
    //     let res = await client.query(query, values);
      
    //     if (res.rows.length > 0) {
    //       return res.rows[0];
    //     }
      
    //     // If not found, get the next batch_no after the date
    //     query = `
    //       SELECT batch_no FROM ${FEED_RECEIPT_CONFIRMATIONS_TABLE}
    //       WHERE farmer_id = $1 AND created_at > $2
    //       ORDER BY created_at ASC
    //       LIMIT 1
    //     `;
    //     res = await client.query(query, values);
      
    //     return res.rows[0] || null;
    //   }

    // async insertFractionalOffsets(client, records) {
    //     if (!records.length) return;
      
    //     const values = [];
    //     const params = [];
      
    //     records.forEach((rec, i) => {
    //       const idx = i * 8;
    //       params.push(
    //         `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8})`
    //       );
    //       values.push(
    //         rec.farmer_id,
    //         rec.cow_id,
    //         rec.camp_lead_verification_id,
    //         rec.lat,
    //         rec.lng,
    //         rec.batch_no,
    //         rec.offset_value,
    //         rec.log_date
    //       );
    //     });
      
    //     const query = `
    //       INSERT INTO ${FRACTIONAL_OFFSETS_TABLE} (
    //         farmer_id, cow_id, camp_lead_verification_id,
    //         lat, lng, batch_no, offset_value, log_date
    //       )
    //       VALUES ${params.join(",")}
    //     `;
      
    //     await client.query(query, values);
    // }

    async getCHOWCommunities(client) {
        const query = `
            SELECT id, camp_lead_id
            FROM ${COMMUNITIES_TABLE}
            WHERE type = 'chow'
        `
        const result = await client.query(query);
        return result.rows || [];
    }

    async insertSystemGeneratedDailyFeedMessages(client, placeholders, values) {
        const query = `
          INSERT INTO messages (community_id, sender_type, sender_id, type, message)
          VALUES ${placeholders}
        `;
        await client.query(query, values);
    }

    async getLatestBatchDetailsAssigned(campLeadId) {
        const query = `
            SELECT 
                b.*,
                ba.acknowledged,
                ba.acknowledged_at
                FROM batches b
            JOIN batch_acknowledgements ba ON ba.batch_id = b.id
            WHERE ba.camp_lead_id = $1
            ORDER BY b.id DESC
            LIMIT 1;
        `
        const res = await db.query(query, [campLeadId]);
      
        return res.rows[0] || null;
    }

    async verifyBatchAssigned(batchId, campLeadId) {
        const query = `
            UPDATE batch_acknowledgements
            SET acknowledged = TRUE,
                acknowledged_at = NOW()
            WHERE batch_id = $1
              AND camp_lead_id = $2;
        `;
    
        const result = await db.query(query, [batchId, campLeadId]);
    
        return result.rowCount > 0;
    }

    async getFarmersByCommunityWithBatchConfirmation(communityId, batchNo) {
        const query = `
            SELECT 
                f.id,
                f.name,
                f.mobile_number,
                f.profile_pic,
                f.place,
                f.cattle_count,
                frc.batch_no,
                frc.created_at AS confirmed_at,
                COALESCE(frc.id IS NOT NULL, FALSE) AS confirmed
            FROM farmers f
            LEFT JOIN feed_receipt_confirmations frc 
                ON frc.farmer_id = f.id 
                AND frc.batch_no = $2
            WHERE f.community_id = $1;
        `;

        const result = await db.query(query, [communityId, batchNo]);
        return result.rows || [];
    }

    async sendFeedDistribution(communityId, farmerId, campLeadId, data) {
        const query = `
            INSERT INTO feed_distribution (
                community_id,
                farmer_id,
                quantity,
                batch_no,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
    
        const values = [
            communityId,
            farmerId,
            data.quantity,
            data.batch_no,
            campLeadId
        ];
    
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async getFarmersListForFeedDistribution(communityId, batchNo) {    
        const query = `
            SELECT
                f.id AS farmer_id,
                f.name,
                ${customFarmerSubQuery},
                f.mobile_number,
                f.profile_pic,
                f.place,
                f.cattle_count,
                f.community_id,
                f.lat,
                f.lng,
                CASE WHEN frc.batch_no IS NOT NULL THEN true ELSE false END AS feed_receipt_status,
                COALESCE(last_confirmed_batches.last_batch, NULL) AS last_batch,
                (f.cattle_count * $3 * $4) AS quantity,
                CASE WHEN fd.id IS NOT NULL THEN true ELSE false END AS feed_sent
            FROM farmers f
            LEFT JOIN feed_receipt_confirmations frc 
                ON f.id = frc.farmer_id 
                AND frc.batch_no = $2
            LEFT JOIN (
                SELECT DISTINCT ON (farmer_id)
                    farmer_id,
                    batch_no AS last_batch
                FROM feed_receipt_confirmations
                ORDER BY farmer_id, created_at DESC
            ) AS last_confirmed_batches
                ON f.id = last_confirmed_batches.farmer_id
            LEFT JOIN feed_distribution fd
                ON f.id = fd.farmer_id
                AND fd.batch_no = $2
            JOIN batches b
                ON b.batch_no = $2
            WHERE f.community_id = $1
                AND f.created_at <= b.created_at
            ORDER BY f.name;
        `;
    
        const values = [communityId, batchNo, FEED_QUANTITY, FEED_DAYS];
        const result = await db.query(query, values);
        return result.rows;
    }

    async getLatestFeedDistribution(farmerId, campLeadId) {
        const query = `
            SELECT
                fd.id AS feed_distribution_id,
                fd.community_id,
                fd.farmer_id,
                fd.quantity,
                fd.batch_no,
                fd.created_at,
                CASE WHEN frc.batch_no IS NOT NULL THEN true ELSE false END AS feed_receipt_status
            FROM feed_distribution fd
            LEFT JOIN feed_receipt_confirmations frc
                ON fd.farmer_id = frc.farmer_id
                AND fd.batch_no = frc.batch_no
            WHERE fd.farmer_id = $1
            ORDER BY fd.created_at DESC
            LIMIT 1;
        `;
        const values = [farmerId];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async confirmFeedDistribution(client, farmerId, batchNo, lat, lng) {
        const query = `
            INSERT INTO feed_receipt_confirmations (
                farmer_id,
                batch_no,
                lat,
                lng
            ) VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [farmerId, batchNo, lat, lng];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    

}

module.exports = CommunityMgtRepository;