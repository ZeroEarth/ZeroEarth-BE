const db = require("../config/db");
const USERS_TABLE = 'users';
const { customFarmerSubQuery } = require("../utils/constants");
const MANAGEABLE_ROLES = ['admin', 'manufacturer', 'camp_lead'];


class AdminRepository {
    async getUserByMobile(client, mobileNumber) {
        const result = await client.query(
            `SELECT * FROM ${USERS_TABLE} WHERE mobile_number = $1 LIMIT 1`,
            [mobileNumber]
        );
        return result.rows[0];
    }

    async addCampLead(client, data) {
        const query = `
            INSERT INTO camp_leads 
            (name, mobile_number, profile_pic, place, state, district, pincode, aadhar, lat, lng, manufacturer_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *;
        `;

        const values = [
            data.name, data.mobile_number, data.profile_pic || null, data.place,
            data.state, data.district, data.pincode, data.aadhar,
            data?.lat || null, data?.lng || null, data.manufacturer_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    }

    async createCommunity(client, data) {
        const query = `
            INSERT INTO communities 
            (name, camp_lead_id, type)
            VALUES ($1,$2,$3)
            RETURNING *;
        `;

        const values = [
            data.name, data.campLeadId, data.type
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    }

    async addManufacturer(client, data, createdBy=null) {
        const query = `
          INSERT INTO manufacturers (name, muid, location, created_by)
          VALUES ($1,$2,$3,$4)
          RETURNING *;
        `;

        const values = [
          data.name, data.muid, data.location || null, createdBy
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    };
      
    async addAdmin (client, data, createdBy=null){
        const query = `
          INSERT INTO admins (name, created_by)
          VALUES ($1, $2)
          RETURNING *;
        `;
        const values = [
          data.name, createdBy
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    };

    async addUser (client, data) {
        const query = `
          INSERT INTO users (mobile_number, password, role, ref_id)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `;
        const values = [
          data.mobile_number,
          data.password,
          data.role,
          data.ref_id
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    };

    async getManufacturers(client) {
        const query = `SELECT * FROM manufacturers`;
        const result = await client.query(query);
        return result.rows || [];
    }

    async getDashBoardDetails () {
        const query = `SELECT
            (SELECT COUNT(*) FROM offsets) AS total_offsets,
            (SELECT COUNT(*) FROM farmers) AS total_farmers,
            (SELECT COALESCE(SUM(cattle_count), 0) FROM farmers) AS total_cattles,
            (SELECT COUNT(*) FROM camp_leads) AS total_campleads;
        `;

        const result = await db.query(query);
        return result.rows[0];

    }

    async getWeeklyOffsets () {
        const query = `WITH weeks AS (
            SELECT generate_series(
                DATE_TRUNC('week', NOW()) - INTERVAL '3 weeks',
                DATE_TRUNC('week', NOW()),
                INTERVAL '1 week'
            )::date AS week_start
            )
            SELECT 
            w.week_start,
            COALESCE(COUNT(o.id), 0)::INT AS total_offsets
            FROM weeks w
            LEFT JOIN offsets o
            ON DATE_TRUNC('week', o.created_at)::date = w.week_start
            GROUP BY w.week_start
            ORDER BY w.week_start ASC;
        `;

        const result = await db.query(query);
        return result.rows;
    }

    async getFarmersByMonth () {
        const query = `
            WITH months AS (
            SELECT generate_series(
                DATE_TRUNC('month', NOW()) - INTERVAL '3 months',
                DATE_TRUNC('month', NOW()),
                INTERVAL '1 month'
            )::date AS month_start
            )
            SELECT 
            m.month_start,
            COALESCE(COUNT(f.id), 0)::INT AS total_farmers
            FROM months m
            LEFT JOIN farmers f
            ON DATE_TRUNC('month', f.created_at)::date = m.month_start
            GROUP BY m.month_start
            ORDER BY m.month_start
        `;

        const result = await db.query(query);
        return result.rows;
    }

    async getPotentialOffsets () {
        // const query = `
        //     SELECT
        //         state,
        //         district,
        //         COUNT(DISTINCT offset_id)::INT AS potential_offsets,
        //         COUNT(DISTINCT offset_id)::INT AS realized_offsets
        //     FROM fractional_offsets
        //     WHERE offset_id IS NOT NULL
        //     GROUP BY state, district
        //     ORDER BY state, district;
        // `;

        const query = `
            SELECT
                p.state,
                p.district,
                p.potential_offset AS potential_offsets,
                COALESCE(COUNT(DISTINCT f.offset_id), 0)::INT AS realized_offsets
            FROM potential_offsets p
            LEFT JOIN fractional_offsets f
                ON p.state = f.state
            AND p.district = f.district
            AND f.offset_id IS NOT NULL
            GROUP BY p.state, p.district, p.potential_offset
            ORDER BY p.state, p.district;
        `

        const result = await db.query(query);
        return result.rows;
    }

    async countTotalOffsets() {
        const query = `
            SELECT COUNT(*) FROM offsets AS o;
        `;
        const result = await db.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async getAllOffsets (limit, offset) {
        const query = `
            SELECT
                id,
                 CONCAT('OFF-', LPAD(id::text, 5, '0')) AS formatted_id
            FROM offsets
            LIMIT $1 OFFSET $2
        `;

        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }

    async getFractionalOffsetById(offsetId) {
        const query = `
            SELECT 
                id,
                farmer_id,
                farmer_custom_id,
                farmer_name,
                aadhar,
                mobile_number,
                place,
                state,
                district,
                pincode,
                farmer_lat,
                farmer_lng,
                farmer_onboarding_date,
                cattle_id,
                feed_batch_id,
                camp_lead_custom_id,
                camp_lead_lat,
                camp_lead_lng,
                log_date,
                feed_given,
                fractional_offset_id,
                verification_date,
                verification_id,
                offset_id,
                verified_lat,
                verified_lng,
                verification_pic,
                note
            FROM fractional_offsets
            WHERE offset_id = $1;
        `;
        const result = await db.query(query, [offsetId]);
        return result.rows;
    }

    async getCampLeads() {
        const query = `
            SELECT 
                cl.id AS camp_lead_id,
                f.id AS farmer_id,
                CONCAT(
                    'MCC_CL',
                    CASE 
                        WHEN cl.id < 100000 
                            THEN LPAD(cl.id::text, 5, '0') 
                        ELSE cl.id::text 
                    END
                ) AS camp_lead_custom_id,
                cl.name,
                cl.mobile_number,
                cl.profile_pic,
                cl.place,
                cl.state,
                cl.district,
                cl.pincode,
                cl.aadhar,
                cl.lat,
                cl.lng,
                f.cattle_count,
                cl.created_at
            FROM camp_leads cl
            JOIN farmers f 
                ON cl.mobile_number = f.mobile_number
            ORDER BY cl.id
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getFarmers() {
        const query = `
            SELECT 
                f.id AS farmer_id,
                ${customFarmerSubQuery},
                f.name,
                f.mobile_number,
                f.profile_pic,
                f.place,
                f.state,
                f.district,
                f.pincode,
                f.aadhar,
                f.lat,
                f.lng,
                f.cattle_count,
                f.created_at
            FROM farmers f
            ORDER BY f.id
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async countUsers(roles = MANAGEABLE_ROLES) {
        const query = `
            SELECT COUNT(*) AS total
            FROM users u
            WHERE u.role = ANY($1::user_role[]);
        `;
        const result = await db.query(query, [roles]);
        return parseInt(result.rows[0].total, 10);
    }
    
    async getAllUsers(limit, offset, roles = MANAGEABLE_ROLES) {
        const query = `
            SELECT 
                u.id,
                u.mobile_number,
                u.role,
                u.ref_id,
                u.created_at,
                COALESCE(cl.name, m.name, a.name, f.name, 'N/A') AS name,
                CASE 
                    WHEN u.role = 'camp_lead' THEN cl.id
                    WHEN u.role = 'manufacturer' THEN m.id
                    WHEN u.role = 'admin' THEN a.id
                    ELSE u.ref_id
                END AS entity_id,
                CASE 
                    WHEN u.role = 'camp_lead' THEN cl.manufacturer_id
                    WHEN u.role = 'manufacturer' THEN m.id
                    ELSE NULL
                END AS manufacturer_id,
                CASE 
                    WHEN u.role = 'manufacturer' THEN m.muid
                    ELSE NULL
                END AS manufacturer_code,
                CASE 
                    WHEN u.role = 'camp_lead' THEN cl.district
                    WHEN u.role = 'manufacturer' THEN m.location
                    ELSE NULL
                END AS location
            FROM users u
            LEFT JOIN farmers f 
                ON u.ref_id = f.id 
                AND u.role IN ('farmer', 'camp_lead')
            LEFT JOIN camp_leads cl 
                ON u.role = 'camp_lead' 
                AND cl.mobile_number = f.mobile_number
            LEFT JOIN manufacturers m 
                ON u.role = 'manufacturer' 
                AND u.ref_id = m.id
            LEFT JOIN admins a 
                ON u.role = 'admin' 
                AND u.ref_id = a.id
            WHERE u.role = ANY($3::user_role[])
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await db.query(query, [limit, offset, roles]);
        return result.rows;
    }

    async countCampLeads() {
        const query = `
            SELECT COUNT(*) AS total
            FROM camp_leads;
        `;
        const result = await db.query(query);
        return parseInt(result.rows[0].total, 10);
    }
    
    async getAllCampLeads(limit, offset) {
        const query = `
            SELECT 
                cl.id AS camp_lead_id,
                f.id AS farmer_id,
                cl.name,
                cl.mobile_number,
                cl.profile_pic,
                cl.place,
                cl.state,
                cl.district,
                cl.pincode,
                cl.aadhar,
                cl.lat,
                cl.lng,
                f.cattle_count,
                cl.manufacturer_id,
                cl.created_at
            FROM camp_leads cl
            JOIN farmers f 
                ON cl.mobile_number = f.mobile_number
            ORDER BY cl.id
            LIMIT $1 OFFSET $2;;
        `;
        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }

    async updateCampLead(client, camplead_id, updateData) {
        const query = `
            UPDATE camp_leads
            SET name = $1, mobile_number = $2, place = $3, state = $4,
                district = $5, pincode = $6, aadhar = $7, manufacturer_id = $8
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            updateData.name,
            updateData.mobile_number,
            updateData.place,
            updateData.state,
            updateData.district,
            updateData.pincode,
            updateData.aadhar,
            updateData.manufacturer_id,
            camplead_id
        ];
        const { rows } = await client.query(query, values);
        return rows[0];
    }

    // Update farmer (mirror of camp lead)
    async updateFarmer(client, farmer_id, updateData) {
        const query = `
            UPDATE farmers
            SET name = $1, mobile_number = $2, place = $3, state = $4,
                district = $5, pincode = $6, aadhar = $7, cattle_count = $8
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            updateData.name,
            updateData.mobile_number,
            updateData.place,
            updateData.state,
            updateData.district,
            updateData.pincode,
            updateData.aadhar,
            updateData.cattle_count,
            farmer_id
        ];
        const { rows } = await client.query(query, values);
        return rows[0];
    }

    // Check if mobile already exists
    async findUserByMobile(client, mobile_number) {
        const query = `SELECT * FROM users WHERE mobile_number = $1 LIMIT 1`;
        const { rows } = await client.query(query, [mobile_number]);
        return rows[0];
    }

    // Update user by ref_id
    async updateUserByRefId(client, farmer_id, updateData) {
        const fields = [];
        const values = [];
        let idx = 1;

        for (const key of Object.keys(updateData)) {
            fields.push(`${key} = $${idx}`);
            values.push(updateData[key]);
            idx++;
        }

        const query = `
            UPDATE users
            SET ${fields.join(', ')}
            WHERE ref_id = $${idx} AND role = 'camp_lead'
            RETURNING *;
        `;
        values.push(farmer_id);

        const { rows } = await client.query(query, values);
        return rows[0];
    }

    // Get user by ID
    async getUserById(client, userId) {
        const query = `SELECT * FROM ${USERS_TABLE} WHERE id = $1 LIMIT 1`;
        const { rows } = await client.query(query, [userId]);
        return rows[0];
    }

    // Update user by user ID
    async updateUserById(client, userId, updateData) {
        const fields = [];
        const values = [];
        let idx = 1;

        for (const key of Object.keys(updateData)) {
            fields.push(`${key} = $${idx}`);
            values.push(updateData[key]);
            idx++;
        }

        const query = `
            UPDATE users
            SET ${fields.join(', ')}
            WHERE id = $${idx}
            RETURNING *;
        `;
        values.push(userId);

        const { rows } = await client.query(query, values);
        return rows[0];
    }
}

module.exports = AdminRepository;
