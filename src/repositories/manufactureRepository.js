const db = require("../config/db");

const { FEED_DAYS, FEED_QUANTITY} = require("../config/serverConfig");


const MANUFACTURERS_TABLE = 'manufacturers';
const BATCHES_TABLE = 'batches';
const BATCH_ACK_TABLE = 'batch_acknowledgements';
const CAMPLEADS_TABLE = 'camp_leads';

class ManufactureRepository {
    async insertBatch(client, batchData) {
        const { batch_no, date_of_manufacturing, quantity, manufacture_id } = batchData;
        const query = `
            INSERT INTO ${BATCHES_TABLE} (batch_no, date_of_manufacturing, quantity, manufacturer_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [batch_no, date_of_manufacturing, quantity, manufacture_id];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async updateBatchNo(client, batchId, batchNo) {
        const query = `
          UPDATE ${BATCHES_TABLE}
          SET batch_no = $1
          WHERE id = $2
          RETURNING *;
        `;
        const values = [batchNo, batchId];
        const result = await client.query(query, values);
        return result.rows[0];
      }

    async getCampLeadsByManufacturer(client, manufactureId) {
        const query = `
            SELECT id FROM ${CAMPLEADS_TABLE} WHERE manufacturer_id = $1;
        `;

        const result = await client.query(query, [manufactureId]);
        return result.rows;
    }

    async insertBatchAcknowledgements(client, ackList) {
        if (ackList.length === 0) return;

        const values = ackList
            .map((ack, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`)
            .join(', ');

        const flatValues = ackList.flatMap(ack => [
            ack.batch_id,
            ack.camp_lead_id,
            ack.acknowledged
        ]);

        const query = `
            INSERT INTO ${BATCH_ACK_TABLE} (batch_id, camp_lead_id, acknowledged)
            VALUES ${values};
        `;

        await client.query(query, flatValues);
    }

    async getAllBatches(manufactureId, limit, offset) {
        console.log("+++++++",manufactureId, limit, offset)
        const query = `
            SELECT * FROM ${BATCHES_TABLE}
            WHERE manufacturer_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const values = [manufactureId, limit, offset];
        const result = await db.query(query, values);
        return result.rows;
    }

    async countBatchesByManufacture(manufactureId) {
        const query = `
            SELECT COUNT(*) FROM ${BATCHES_TABLE} WHERE manufacturer_id = $1;
        `;

        const result = await db.query(query, [manufactureId]);
        return parseInt(result.rows[0].count, 10);
    }

    async countCampleadsUnderManufacture(manufactureId) {
        const query = `
            SELECT COUNT(*)
            FROM ${CAMPLEADS_TABLE} cl
            WHERE cl.manufacturer_id = $1
        `
        const result = await db.query(query, [manufactureId]);
        return parseInt(result.rows[0].count, 10);
    }

    async getBatchDetail(batchId, manufactureId) {
        const query = `
            SELECT 
                b.date_of_manufacturing,
                b.quantity,
                b.batch_no,
                m.location,
                m.muid
            FROM ${BATCHES_TABLE} b
            INNER JOIN ${MANUFACTURERS_TABLE} m ON b.manufacturer_id = m.id
            WHERE b.id = $1 AND m.id = $2
        `

        const result = await db.query(query, [batchId, manufactureId]);
        return result.rows[0];
    }

    async getCampleadsAcks(batchId, manufactureId, limit, offset) {
        const query = `
            SELECT 
                cl.id,
                cl.name,
                cl.mobile_number,
                cl.profile_pic,
                cl.place,
                COALESCE(ba.acknowledged, false) AS acknowledged,
                ba.acknowledged_at
            FROM ${CAMPLEADS_TABLE} cl
            LEFT JOIN ${BATCH_ACK_TABLE} ba 
                ON ba.camp_lead_id = cl.id AND ba.batch_id = $1
            WHERE cl.manufacturer_id = $2
            ORDER BY cl.created_at DESC
            LIMIT $3 OFFSET $4
        `
        const values = [batchId, manufactureId, limit, offset];
        const result = await db.query(query, values);
        return result.rows;
    }

    async getDeliveryDetails(manufacturerId, limit, offset) {
        const query = `
            SELECT 
                cl.id AS camp_lead_id,
                cl.name,
                cl.profile_pic,
                cl.place,
                cl.pincode,
                cl.district,
                cl.state,
                COALESCE(SUM(f.cattle_count), 0) AS total_cattles,
                COALESCE(SUM(f.cattle_count), 0) 
                    * $2::INTEGER 
                    * $3::INTEGER AS total_quantity
            FROM camp_leads cl
            INNER JOIN communities c 
                ON c.camp_lead_id = cl.id
            LEFT JOIN farmers f 
                ON f.community_id = c.id
            WHERE cl.manufacturer_id = $1
            GROUP BY cl.id, cl.place, cl.pincode, cl.district, cl.state
            ORDER BY cl.id
            LIMIT $4 OFFSET $5
        `;
    
        const values = [
            manufacturerId,
            FEED_QUANTITY,
            FEED_DAYS,
            limit,
            offset
        ];
    
        const result = await db.query(query, values);
        return result.rows;
    }

    async countCampleadsUnderManufacturer(manufacturerId) {
        const query = `
            SELECT COUNT(DISTINCT cl.id) AS total
            FROM camp_leads cl
            INNER JOIN communities c 
                ON c.camp_lead_id = cl.id
            WHERE cl.manufacturer_id = $1
        `;
        
        const result = await db.query(query, [manufacturerId]);
        return parseInt(result.rows[0].total, 10);
    }
    
    async countManufacturers() {
        const query = `
            SELECT COUNT(*) AS total
            FROM manufacturers;
        `;
        const result = await db.query(query);
        return parseInt(result.rows[0].total, 10);
    }

    async getAllManufacturers(limit, offset) {
        const query = `
            SELECT 
                m.id AS manufacturer_id,
                m.name AS manufacturer_name,
                m.muid AS manufacturer_muid,
                m.location,
                u.id AS user_id,
                u.mobile_number,
                u.password,        -- optional, if needed for admin
                u.role,
                m.created_by,
                m.created_at
            FROM manufacturers m
            LEFT JOIN users u 
                ON u.ref_id = m.id AND u.role = 'manufacturer'
            ORDER BY m.name ASC
            LIMIT $1 OFFSET $2;
        `;

        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }

    async findUserByMobile(client, mobile_number) {
        const query = `SELECT * FROM users WHERE mobile_number = $1 LIMIT 1`;
        const { rows } = await client.query(query, [mobile_number]);
        return rows[0];
    }
    
    async getManufacturerById(client, manufacturerId) {
        const query = `
            SELECT * FROM ${MANUFACTURERS_TABLE} 
            WHERE id = $1 
            LIMIT 1
        `;
        const { rows } = await client.query(query, [manufacturerId]);
        return rows[0];
    }

    async updateManufacturer(client, manufacturer_id, updateData) {
        const query = `
            UPDATE manufacturers
            SET name = $1,
                location = $2,
                muid = $3
            WHERE id = $4
            RETURNING *
        `;
        const values = [
            updateData.name,
            updateData.location,
            updateData.muid,
            manufacturer_id
        ];
    
        const { rows } = await client.query(query, values);
        return rows[0];
    }

    async updateUserByRefId(client, ref_id, updateData) {
        if (updateData.password) {
            // Update both mobile_number and password
            const query = `
                UPDATE users
                SET mobile_number = $1,
                    password = $2
                WHERE ref_id = $3 AND role = 'manufacturer'
                RETURNING *
            `;
            const values = [updateData.mobile_number, updateData.password, ref_id];
            const { rows } = await client.query(query, values);
            return rows[0];
        } else {
            // Only mobile_number
            const query = `
                UPDATE users
                SET mobile_number = $1
                WHERE ref_id = $2 AND role = 'manufacturer'
                RETURNING *
            `;
            const values = [updateData.mobile_number, ref_id];
            const { rows } = await client.query(query, values);
            return rows[0];
        }
    }

}

module.exports = ManufactureRepository;