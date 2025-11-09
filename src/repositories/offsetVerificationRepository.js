const db = require("../config/db");

const FARMER_TABLE = 'farmers';
const COMMUNITIES_TABLE = 'communities';
const CAMPLEADS_VISITS_TABLE = 'camp_lead_visits';
const FRACTIONAL_OFFSETS_TABLE = 'fractional_offsets';
const FEED_RECEIPT_CONFIRMATIONS_TABLE= 'feed_receipt_confirmations';

class OffsetVerificationRepository {
    async getOffsetVerificationList(farmerId) {
        // const query = `
        // WITH last_verified AS (
        //     SELECT 
        //         f.id AS farmer_id,
        //         COALESCE(MAX(clv.date_of_visit), MIN(frc.created_at::date)) AS start_date
        //     FROM farmers f
        //     LEFT JOIN camp_lead_visits clv 
        //         ON clv.farmer_id = f.id
        //     LEFT JOIN feed_receipt_confirmations frc 
        //         ON frc.farmer_id = f.id
        //     WHERE f.id = $1  -- farmer_id param
        //     GROUP BY f.id
        // ),
        // date_series AS (
        //     SELECT 
        //         lv.farmer_id,
        //         generate_series(lv.start_date, CURRENT_DATE, interval '1 day')::date AS log_date
        //     FROM last_verified lv
        // ),
        // cattle_list AS (
        //     SELECT 
        //         ds.farmer_id,
        //         ds.log_date,
        //         generate_series(1, f.cattle_count) AS cattle_num
        //     FROM date_series ds
        //     JOIN farmers f ON f.id = ds.farmer_id
        // ),
        // expanded AS (
        //     SELECT
        //         c.farmer_id,
        //         f.name AS farmer_name,
        //         f.mobile_number,
        //         f.lat AS farmer_lat,
        //         f.lng AS farmer_lng,
        //         f.place,
        //         f.created_at::date AS farmer_onboarding_date,
        //         CONCAT(f.id, '/', LPAD(c.cattle_num::text, 2, '0')) AS cattle_id,
        //         latest_batch.batch_no AS feed_batch_id,
        //         com.camp_lead_id,
        //         cl.lat AS camp_lead_lat,
        //         cl.lng AS camp_lead_lng,
        //         c.log_date,
        //         CASE WHEN dfc.farmer_id IS NOT NULL THEN 'yes' ELSE NULL END AS feed_given,
        //         CASE WHEN dfc.farmer_id IS NOT NULL 
        //             THEN CONCAT(f.id, '/', LPAD(c.cattle_num::text, 2, '0'), '/FOID', TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY'))
        //             ELSE NULL
        //         END AS fractional_offset_id,
        //         CASE WHEN dfc.farmer_id IS NOT NULL THEN CURRENT_DATE ELSE NULL END AS verification_date,
        //         CASE WHEN dfc.farmer_id IS NOT NULL 
        //             THEN CONCAT(
        //                 CONCAT(f.id, '/', LPAD(c.cattle_num::text, 2, '0'), '/FOID', TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY')),
        //                 '/',
        //                 com.camp_lead_id,
        //                 '/VD'
        //             )
        //             ELSE NULL
        //         END AS verification_id,
        //         clv.note
        //     FROM cattle_list c
        //     JOIN farmers f ON f.id = c.farmer_id
        //     -- Get latest batch for that day
        //     LEFT JOIN LATERAL (
        //         SELECT frc.batch_no
        //         FROM feed_receipt_confirmations frc
        //         WHERE frc.farmer_id = f.id
        //         AND frc.created_at::date <= c.log_date
        //         ORDER BY frc.created_at DESC
        //         LIMIT 1
        //     ) latest_batch ON true
        //     JOIN communities com ON com.id = f.community_id
        //     LEFT JOIN camp_leads cl ON cl.id = com.camp_lead_id
        //     LEFT JOIN daily_feed_confirmations dfc
        //         ON dfc.farmer_id = f.id
        //     AND dfc.created_at::date = c.log_date
        //     LEFT JOIN fractional_offsets fo 
        //         ON fo.farmer_id = f.id
        //     AND fo.cow_id = CONCAT(f.id, '/', LPAD(c.cattle_num::text, 2, '0'))
        //     AND fo.log_date::date = c.log_date
        //     LEFT JOIN camp_lead_visits clv 
        //         ON clv.farmer_id = f.id
        //     AND clv.date_of_visit = c.log_date
        //     ORDER BY c.log_date DESC, cattle_id
        // )
        // SELECT * FROM expanded;
        // `
        // const query = `
        //     WITH last_verified AS (
        //         SELECT 
        //             f.id AS farmer_id,
        //             COALESCE(MAX(clv.date_of_visit), MIN(frc.created_at::date)) AS start_date
        //         FROM farmers f
        //         LEFT JOIN camp_lead_visits clv 
        //             ON clv.farmer_id = f.id
        //         LEFT JOIN feed_receipt_confirmations frc 
        //             ON frc.farmer_id = f.id
        //         WHERE f.id = $1  -- farmer_id param
        //         GROUP BY f.id
        //     ),
        //     date_series AS (
        //         SELECT 
        //             lv.farmer_id,
        //             generate_series(lv.start_date, CURRENT_DATE, interval '1 day')::date AS log_date
        //         FROM last_verified lv
        //     ),
        //     cattle_list AS (
        //         SELECT 
        //             ds.farmer_id,
        //             ds.log_date,
        //             generate_series(1, f.cattle_count) AS cattle_num
        //         FROM date_series ds
        //         JOIN farmers f ON f.id = ds.farmer_id
        //     ),
        //     expanded AS (
        //         SELECT
        //             c.farmer_id,
        //             -- Custom Farmer ID
        //             CONCAT(
        //                 'F_',
        //                 f.state, '_',
        //                 UPPER(LEFT(f.place, 3)), '_',
        //                 RIGHT(f.pincode, 3), '_',
        //                 LPAD(f.id::text, 4, '0')
        //             ) AS farmer_custom_id,
        //             f.name AS farmer_name,
        //             f.mobile_number,
        //             f.lat AS farmer_lat,
        //             f.lng AS farmer_lng,
        //             f.place,
        //             f.created_at::date AS farmer_onboarding_date,
                    
        //             -- Cattle ID
        //             CONCAT(
        //                 CONCAT(
        //                     'F_',
        //                     f.state, '_',
        //                     UPPER(LEFT(f.place, 3)), '_',
        //                     RIGHT(f.pincode, 3), '_',
        //                     LPAD(f.id::text, 4, '0')
        //                 ),
        //                 '/',
        //             CASE 
        //         WHEN c.cattle_num < 10 
        //             THEN LPAD(c.cattle_num::text, 2, '0') 
        //         ELSE c.cattle_num::text 
        //     END
        //             ) AS cattle_id,

        //             latest_batch.batch_no AS feed_batch_id,
        //             com.camp_lead_id,
        //             cl.lat AS camp_lead_lat,
        //             cl.lng AS camp_lead_lng,
        //             c.log_date,

        //             CASE WHEN dfc.farmer_id IS NOT NULL THEN 'yes' ELSE NULL END AS feed_given,

        //             -- Fractional Offset ID
        //             CASE WHEN dfc.farmer_id IS NOT NULL 
        //                 THEN CONCAT(
        //                     CONCAT(
        //                         'F_',
        //                         f.state, '_',
        //                         UPPER(LEFT(f.place, 3)), '_',
        //                         RIGHT(f.pincode, 3), '_',
        //                         LPAD(f.id::text, 4, '0')
        //                     ),
        //                     '/',
        //                     LPAD(c.cattle_num::text, 2, '0'),
        //                     '/FOID',
        //                     TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY')
        //                 )
        //                 ELSE NULL
        //             END AS fractional_offset_id,

        //             CASE WHEN dfc.farmer_id IS NOT NULL THEN CURRENT_DATE ELSE NULL END AS verification_date,

        //             -- Verification ID
        //             CASE WHEN dfc.farmer_id IS NOT NULL 
        //                 THEN CONCAT(
        //                     CONCAT(
        //                         CONCAT(
        //                             'F_',
        //                             f.state, '_',
        //                             UPPER(LEFT(f.place, 3)), '_',
        //                             RIGHT(f.pincode, 3), '_',
        //                             LPAD(f.id::text, 4, '0')
        //                         ),
        //                         '/',
        //                         LPAD(c.cattle_num::text, 2, '0'),
        //                         '/FOID',
        //                         TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY')
        //                     ),
        //                     '/',
        //                     com.camp_lead_id,
        //                     '/VD'
        //                 )
        //                 ELSE NULL
        //             END AS verification_id,

        //             clv.note

        //         FROM cattle_list c
        //         JOIN farmers f ON f.id = c.farmer_id

        //         -- Get latest batch for that day
        //         LEFT JOIN LATERAL (
        //             SELECT frc.batch_no
        //             FROM feed_receipt_confirmations frc
        //             WHERE frc.farmer_id = f.id
        //             AND frc.created_at::date <= c.log_date
        //             ORDER BY frc.created_at DESC
        //             LIMIT 1
        //         ) latest_batch ON true

        //         JOIN communities com ON com.id = f.community_id
        //         LEFT JOIN camp_leads cl ON cl.id = com.camp_lead_id
        //         LEFT JOIN daily_feed_confirmations dfc
        //             ON dfc.farmer_id = f.id
        //         AND dfc.created_at::date = c.log_date
        //         LEFT JOIN fractional_offsets fo 
        //             ON fo.farmer_id = f.id
        //         AND fo.cow_id = CONCAT(
        //                 'F_',
        //                 f.state, '_',
        //                 UPPER(LEFT(f.place, 3)), '_',
        //                 RIGHT(f.pincode, 3), '_',
        //                 LPAD(f.id::text, 4, '0'),
        //                 '/',
        //                 LPAD(c.cattle_num::text, 2, '0')
        //         )
        //         AND fo.log_date::date = c.log_date
        //         LEFT JOIN camp_lead_visits clv 
        //             ON clv.farmer_id = f.id
        //         AND clv.date_of_visit = c.log_date

        //         ORDER BY c.log_date ASC, c.cattle_num
        //     )
        //     SELECT * FROM expanded;

        // `
        const query = `
            WITH last_verified AS (
                SELECT 
                    f.id AS farmer_id,
                    COALESCE(MAX(clv.date_of_visit) + INTERVAL '1 day', MIN(frc.created_at::date)) AS start_date
                FROM farmers f
                LEFT JOIN camp_lead_visits clv 
                    ON clv.farmer_id = f.id
                LEFT JOIN feed_receipt_confirmations frc 
                    ON frc.farmer_id = f.id
                WHERE f.id = $1  -- farmer_id param
                GROUP BY f.id
            ),
            date_series AS (
                SELECT 
                    lv.farmer_id,
                    generate_series(lv.start_date, CURRENT_DATE, interval '1 day')::date AS log_date
                FROM last_verified lv
            ),
            cattle_list AS (
                SELECT 
                    ds.farmer_id,
                    ds.log_date,
                    generate_series(1, f.cattle_count) AS cattle_num
                FROM date_series ds
                JOIN farmers f ON f.id = ds.farmer_id
            ),
            -- Deduplicate daily_feed_confirmations by farmer + date
            dedup_dfc AS (
                SELECT DISTINCT ON (dfc.farmer_id, dfc.created_at::date) dfc.*
                FROM daily_feed_confirmations dfc
                ORDER BY dfc.farmer_id, dfc.created_at::date, dfc.created_at DESC
            ),
            expanded AS (
                SELECT
                    c.farmer_id,
                    -- Custom Farmer ID
                    CONCAT(
                        'F_',
                        f.state, '_',
                        UPPER(LEFT(f.place, 3)), '_',
                        RIGHT(f.pincode, 3), '_',
                        CASE 
                            WHEN f.id < 10000 
                                THEN LPAD(f.id::text, 4, '0') 
                            ELSE f.id::text 
                        END
                    ) AS farmer_custom_id,
                    f.name AS farmer_name,
                    f.mobile_number,
                    f.lat AS farmer_lat,
                    f.lng AS farmer_lng,
                    f.place,
                    f.state,
                    f.district,
                    f.pincode,
                    f.aadhar,
                    f.created_at::date AS farmer_onboarding_date,
                    
                    -- Cattle ID
                    CONCAT(
                        CONCAT(
                            'F_',
                            f.state, '_',
                            UPPER(LEFT(f.place, 3)), '_',
                            RIGHT(f.pincode, 3), '_',
                            CASE 
                                WHEN f.id < 10000 
                                    THEN LPAD(f.id::text, 4, '0') 
                                ELSE f.id::text 
                            END
                        ),
                        '/',
                        CASE 
                            WHEN c.cattle_num < 10 
                                THEN LPAD(c.cattle_num::text, 2, '0') 
                            ELSE c.cattle_num::text 
                        END
                    ) AS cattle_id,

                    latest_batch.batch_no AS feed_batch_id,
                    com.camp_lead_id,
                    CONCAT(
                        'MCC_CL',
                        CASE 
                            WHEN com.camp_lead_id < 100000 
                                THEN LPAD(com.camp_lead_id::text, 5, '0') 
                            ELSE com.camp_lead_id::text 
                        END
                    ) AS camp_lead_custom_id,
                    cl.lat AS camp_lead_lat,
                    cl.lng AS camp_lead_lng,
                    c.log_date,

                    CASE WHEN dfc.farmer_id IS NOT NULL THEN 'yes' ELSE NULL END AS feed_given,

                    -- Fractional Offset ID
                    CASE WHEN dfc.farmer_id IS NOT NULL 
                        THEN CONCAT(
                            CONCAT(
                                'F_',
                                f.state, '_',
                                UPPER(LEFT(f.place, 3)), '_',
                                RIGHT(f.pincode, 3), '_',
                                CASE 
                                    WHEN f.id < 10000 
                                        THEN LPAD(f.id::text, 4, '0') 
                                    ELSE f.id::text 
                                END
                            ),
                            '/',
                            CASE 
                                WHEN c.cattle_num < 10 
                                    THEN LPAD(c.cattle_num::text, 2, '0') 
                                ELSE c.cattle_num::text 
                            END,
                            '/FOID',
                            TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY')
                        )
                        ELSE NULL
                    END AS fractional_offset_id,

                    CASE WHEN dfc.farmer_id IS NOT NULL THEN CURRENT_DATE ELSE NULL END AS verification_date,

                    -- Verification ID
                    CASE WHEN dfc.farmer_id IS NOT NULL 
                        THEN CONCAT(
                            CONCAT(
                                CONCAT(
                                    'F_',
                                    f.state, '_',
                                    UPPER(LEFT(f.place, 3)), '_',
                                    RIGHT(f.pincode, 3), '_',
                                    CASE 
                                        WHEN f.id < 10000 
                                            THEN LPAD(f.id::text, 4, '0') 
                                        ELSE f.id::text 
                                    END
                                ),
                                '/',
                                CASE 
                                    WHEN c.cattle_num < 10 
                                        THEN LPAD(c.cattle_num::text, 2, '0') 
                                    ELSE c.cattle_num::text 
                                END,
                                '/FOID',
                                TO_CHAR(c.log_date - INTERVAL '1 day', 'DDMMYYYY')
                            ),
                            '/',
                            CONCAT(
                                'MCC_CL',
                                CASE 
                                    WHEN com.camp_lead_id < 100000 
                                        THEN LPAD(com.camp_lead_id::text, 5, '0') 
                                    ELSE com.camp_lead_id::text 
                                END
                            ) ,
                            '/VD'
                        )
                        ELSE NULL
                    END AS verification_id,
                    CASE WHEN dfc.farmer_id IS NOT NULL THEN (1.0/360)::double precision ELSE 0.0::double precision END AS offset_value,
                    clv.note

                FROM cattle_list c
                JOIN farmers f ON f.id = c.farmer_id

                -- Get latest batch for that day
                LEFT JOIN LATERAL (
                    SELECT frc.batch_no
                    FROM feed_receipt_confirmations frc
                    WHERE frc.farmer_id = f.id
                    AND frc.created_at::date <= c.log_date
                    ORDER BY frc.created_at DESC
                    LIMIT 1
                ) latest_batch ON true

                JOIN communities com ON com.id = f.community_id
                LEFT JOIN camp_leads cl ON cl.id = com.camp_lead_id
                LEFT JOIN dedup_dfc dfc
                    ON dfc.farmer_id = f.id
                AND dfc.created_at::date = c.log_date

                LEFT JOIN camp_lead_visits clv 
                    ON clv.farmer_id = f.id
                AND clv.date_of_visit = c.log_date

                ORDER BY c.log_date ASC, c.cattle_num
            )
            SELECT * FROM expanded;
        `
        const result = await db.query(query, [farmerId]);
        return result.rows;
    }

    async getFarmersListForOffsetVerification(communityId, limit, offset) {
        const query = `
            SELECT 
                f.id AS farmer_id,
                CONCAT(
                        'F_',
                        f.state, '_',
                        UPPER(LEFT(f.place, 3)), '_',
                        RIGHT(f.pincode, 3), '_',
                        CASE 
                            WHEN f.id < 10000 
                                THEN LPAD(f.id::text, 4, '0') 
                            ELSE f.id::text 
                        END
                    ) AS farmer_custom_id,
                f.name AS farmer_name,
                f.profile_pic,
                f.cattle_count,
                f.place,
                f.lat,
                f.lng,
                f.created_at AS onboarded_date,
                COALESCE(visits.latest_visit, NULL) AS last_verified,
                batch.batch_no AS latest_batch
            FROM ${FARMER_TABLE} f
            LEFT JOIN (
                SELECT farmer_id, MAX(date_of_visit) AS latest_visit
                FROM ${CAMPLEADS_VISITS_TABLE}
                GROUP BY farmer_id
            ) visits ON f.id = visits.farmer_id
            LEFT JOIN LATERAL (
                SELECT batch_no
                FROM ${FEED_RECEIPT_CONFIRMATIONS_TABLE}
                WHERE farmer_id = f.id
                ORDER BY created_at DESC
                LIMIT 1
            ) batch ON true
            WHERE f.community_id = $1
            ORDER BY f.lat, f.lng
            LIMIT $2 OFFSET $3;
        `;

    //     ORDER BY 
    // 6371 * acos(
    //     cos(radians($4)) 
    //     * cos(radians(f.lat)) 
    //     * cos(radians(f.lng) - radians($5)) 
    //     + sin(radians($4)) 
    //     * sin(radians(f.lat))
    // )
    //Haversine formula
    // Where:
    // $4 = reference latitude
    // $5 = reference longitude
    // 6371 = Earth’s radius in km (use 3959 for miles).

        const values = [communityId, limit, offset];
        const result = await db.query(query, values);

        return result.rows;

    }

    async upsertCampLeadVisit(client, data) {
        const query = `
        INSERT INTO ${CAMPLEADS_VISITS_TABLE} (community_id, farmer_id, date_of_visit, lat, lng)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (farmer_id)
        DO UPDATE SET
            community_id = EXCLUDED.community_id,
            date_of_visit = EXCLUDED.date_of_visit,
            note = EXCLUDED.note,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng
        RETURNING *
        `
        const values = [
            data.community_id,
            data.farmer_id,
            data.date_of_visit,
            data.verified_lat,
            data.verified_lng
        ];

        const res = await client.query(query, values);
        return res.rows[0];
    }

    async bulkInsertFractionalOffsets(client, fractional_offsets, verified_lat, verified_lng, verification_pic) {
        if (!fractional_offsets?.length) return;
    
        // First, delete any existing records for this farmer to avoid duplicates
        // This ensures we don't have duplicate records for the same verification
        const farmerIds = [...new Set(fractional_offsets.map(item => item.farmer_id))];
        if (farmerIds.length > 0) {
            const deleteQuery = `
                DELETE FROM fractional_offsets 
                WHERE farmer_id = ANY($1) 
                AND verification_id IS NOT NULL
                AND verification_date IS NOT NULL
            `;
            await client.query(deleteQuery, [farmerIds]);
        }
    
        // These are the fields that come from each item
        const itemFields = [
            'farmer_id', 'farmer_custom_id', 'farmer_name', 'mobile_number',
            'farmer_lat', 'farmer_lng', 'place', 'state', 'district', 'pincode',
            'farmer_onboarding_date', 'cattle_id', 'feed_batch_id', 'camp_lead_id',
            'camp_lead_custom_id', 'camp_lead_lat', 'camp_lead_lng', 'log_date',
            'feed_given', 'fractional_offset_id', 'verification_date', 'verification_id',
            'offset_value', 'note', 'aadhar'
        ];
    
        // Shared fields
        const sharedFields = ['verified_lat', 'verified_lng', 'verification_pic'];
    
        const columns = [...itemFields, ...sharedFields];
    
        // Generate placeholders dynamically
        const placeholders = fractional_offsets.map((_, rowIndex) => {
            const baseIndex = rowIndex * columns.length;
            return `(${columns.map((_, colIndex) => `$${baseIndex + colIndex + 1}`).join(',')})`;
        }).join(',');
    
        // Build values array: each row has its own item values + shared values
        const values = fractional_offsets.flatMap(item => [
            ...itemFields.map(f => item[f]),
            verified_lat,
            verified_lng,
            verification_pic,
        ]);
    
        const query = `
            INSERT INTO fractional_offsets (${columns.join(',')})
            VALUES ${placeholders}
        `;
    
        await client.query(query, values);
    }

    async finalizeOffsets(client) {
        while (true) {
          // 1. Fetch next 400 verified & unassigned rows
          const { rows: batch } = await client.query(`
            SELECT id 
            FROM fractional_offsets
            WHERE offset_id IS NULL
              AND verification_id IS NOT NULL
            ORDER BY id
            LIMIT 400
          `);
      
          if (batch.length < 400) break; // not enough for a full offset
      
          const ids = batch.map(r => r.id);
      
          // 2. Create a new offset
          const { rows: [{ id: offsetId }] } = await client.query(
            `INSERT INTO offsets default VALUES  RETURNING id;`,
          );
      
          // 3. Update contributing fractional rows
          await client.query(
            `UPDATE fractional_offsets SET offset_id = $1 WHERE id = ANY($2)`,
            [offsetId, ids]
          );
        }
      }
    
}



module.exports = OffsetVerificationRepository;