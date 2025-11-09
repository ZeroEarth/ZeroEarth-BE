module.exports = {
   customFarmerSubQuery: `
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
        ) AS farmer_custom_id
    `,
}