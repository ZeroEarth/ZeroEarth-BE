-- Insert script for fractional_offsets table
-- Generated from data_fractional_offsets.csv

-- First, let's insert the data using COPY command for better performance
-- Note: Update the file path to match your actual CSV location

\copy fractional_offsets(
    id,
    farmer_id,
    farmer_custom_id,
    farmer_name,
    aadhar,
    mobile_number,
    farmer_lat,
    farmer_lng,
    place,
    state,
    district,
    pincode,
    farmer_onboarding_date,
    cattle_id,
    feed_batch_id,
    camp_lead_id,
    camp_lead_custom_id,
    camp_lead_lat,
    camp_lead_lng,
    log_date,
    feed_given,
    fractional_offset_id,
    verification_date,
    verification_id,
    offset_value,
    note,
    offset_id,
    verified_lat,
    verified_lng,
    verification_pic,
    created_at
) FROM 'src/seed_data/data_fractional_offsets.csv' WITH (FORMAT csv, HEADER true);

-- Alternative: If you prefer individual INSERT statements, use the script below
-- (commented out for performance reasons - uncomment if needed)

/*
-- The following INSERT statements were generated from the CSV data
-- Uncomment this section if you prefer individual INSERTs over COPY

-- Example of first few records:
INSERT INTO fractional_offsets (
    id, farmer_id, farmer_custom_id, farmer_name, aadhar, mobile_number,
    farmer_lat, farmer_lng, place, state, district, pincode,
    farmer_onboarding_date, cattle_id, feed_batch_id, camp_lead_id,
    camp_lead_custom_id, camp_lead_lat, camp_lead_lng, log_date,
    feed_given, fractional_offset_id, verification_date, verification_id,
    offset_value, note, offset_id, verified_lat, verified_lng,
    verification_pic, created_at
) VALUES
(1, 1, 'F_TN_PET_301_0001', 'Anitha Gnanavel', '448836864939', '9344481240',
 11.587498, 78.917042, 'Pethasamudram', 'TN', 'Viluppuram', '606301',
 '2025-07-02 16:24:33', 'F_TN_PET_301_0001/01', 'ZEC_MCC_B0725/01', 1,
 'MCC_CL00001', 11.587498, 78.917042, '2025-07-09',
 'yes', 'F_TN_PET_301_0001/01/FOID2812234', '29/08/2025', 'F_TN_PET_301_0001/01/FOID2812234/1/VD',
 0.0025, '', 1, 11.58755982, 78.91723282,
 '', '29/08/2025');

-- Add more INSERT statements here as needed...
*/

-- Update sequence to match the highest ID in the imported data
SELECT setval('fractional_offsets_id_seq', (SELECT MAX(id) FROM fractional_offsets));