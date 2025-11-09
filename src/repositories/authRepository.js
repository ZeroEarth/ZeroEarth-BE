const db = require("../config/db");

class AuthRepository {
    async findCampLeadByMobile(mobile) {
        const result = await db.query(
            `SELECT 
                cl.id, 
                cl.name, 
                c.id as community_id,
                c.name as community_name,
                c.camp_lead_id
            FROM camp_leads cl
            LEFT JOIN communities c ON cl.id = c.camp_lead_id
            WHERE cl.mobile_number = $1
            LIMIT 1`,
            [mobile]
        );
        return result.rows[0];
    }

    async isCampLeadOfCommunity(campLeadId, mobile) {
        const result = await db.query(
            `SELECT 1 FROM camp_leads 
             WHERE id = $1 AND mobile_number = $2`,
            [campLeadId, mobile]
        );
        return result.rowCount > 0;
    }

    async findFarmerByMobile(mobile) {
        console.log("=++++++++++", mobile)
        const result = await db.query(
            `SELECT 
                f.id,    
                f.name, 
                f.cattle_count,
                f.mobile_number,
                f.community_id, 
                c.camp_lead_id,
                c.name as community_name,
                f.profile_pic,
                f.place,
                f.lat,
                f.lng
            FROM farmers f
            JOIN communities c ON f.community_id = c.id
            WHERE f.mobile_number = $1`,
          [mobile]
        );
        return result.rows[0];
      }
    
    /**
     * Find user by mobile number
     * @param {string} mobile - The mobile number to search for
     * @returns {Promise<Object|null>} User object or null if not found
     */
    async findUserByMobile(mobile) {
        const result = await db.query(
            `SELECT id, mobile_number, password, role, ref_id FROM users WHERE mobile_number = $1`,
            [mobile]
        );
        return result.rows[0];
    }

    async findUserById(id) {
        const result = await db.query(
            `SELECT id, role FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async getFarmerDetails(id) {
        const result = await db.query(
            `SELECT 
                f.id, 
                f.name, 
                f.cattle_count, 
                f.mobile_number,
                f.profile_pic, 
                f.place, 
                f.lat, 
                f.lng, 
                f.community_id,
                f.terms_accepted, 
                c.name as community_name, 
                c.camp_lead_id
             FROM farmers f
             JOIN communities c ON f.community_id = c.id
             WHERE f.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async getCampLeadDetails(id) {
        const result = await db.query(
            `SELECT 
                cl.id, cl.name, cl.mobile_number, cl.profile_pic, cl.place,
                c.id as community_id, c.name as community_name
             FROM camp_leads cl
             LEFT JOIN communities c ON cl.id = c.camp_lead_id
             WHERE cl.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async getManufacturerDetails(id) {
        const result = await db.query(
            `SELECT id, name, muid, location FROM manufacturers WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async getAdminDetails(id) {
        const result = await db.query(
            `SELECT id, name FROM admins WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async updateTermsWithLocation(client, data) {
        const { farmerId, campLeadId, role, lat, lng } = data;
        await client.query(
            `
            UPDATE farmers
            SET lat = $1,
                lng = $2,
                terms_accepted = TRUE
            WHERE id = $3
            `,
            [lat, lng, farmerId]
        );

        if (role === 'camp_lead' && campLeadId) {
            await client.query(
                `
                UPDATE camp_leads
                SET lat = $1,
                    lng = $2
                WHERE id = $3
                `,
                [lat, lng, campLeadId]
            );
        }
        return;
    }
}

module.exports = AuthRepository;