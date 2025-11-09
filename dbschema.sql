--9. manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muid VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(200),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. users
CREATE TYPE user_role AS ENUM ('farmer', 'camp_lead', 'manufacturer', 'auditor', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL,
  ref_id INTEGER, -- points to farmer.id, manufacturers.id .... // NOTE: For campleads this should refer to farmers.id as campleads are also farmers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. camp_leads
CREATE TABLE IF NOT EXISTS camp_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    profile_pic TEXT,
    place VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    pincode VARCHAR(10),
    aadhar VARCHAR(50),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. communities
CREATE TYPE community_type AS ENUM ('chow');

CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    camp_lead_id INTEGER REFERENCES camp_leads(id),
    type community_type DEFAULT 'chow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. farmers
CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    profile_pic TEXT,
    place VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    pincode VARCHAR(10),
    cattle_count INTEGER DEFAULT 0,
    aadhar VARCHAR(50),
    community_id INTEGER REFERENCES communities(id),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    terms_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. messages
CREATE TYPE sender_enum AS ENUM ('camp_lead', 'farmer');
CREATE TYPE message_type_enum AS ENUM ('feed_distribution', 'daily_feed', 'feed_receipt', 'daily_feed_response');

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    sender_type sender_enum NOT NULL,
    sender_id INTEGER NOT NULL,
    type message_type_enum NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. feed_receipt_confirmations
CREATE TABLE IF NOT EXISTS feed_receipt_confirmations (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    farmer_id INTEGER REFERENCES farmers(id),
    batch_no VARCHAR(50) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. daily_feed_confirmations
CREATE TABLE IF NOT EXISTS daily_feed_confirmations (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    farmer_id INTEGER REFERENCES farmers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. camp_lead_visits
CREATE TABLE IF NOT EXISTS camp_lead_visits (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    farmer_id INTEGER UNIQUE REFERENCES farmers(id),
    date_of_visit DATE NOT NULL,
    note TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. fractional_offsets
-- CREATE TABLE IF NOT EXISTS fractional_offsets (
--     id SERIAL PRIMARY KEY,
--     farmer_id INTEGER REFERENCES farmers(id),
--     cow_id VARCHAR(100) NOT NULL,
--     camp_lead_verification_id INTEGER REFERENCES camp_lead_visits(id),
--     lat DOUBLE PRECISION NOT NULL,
--     lng DOUBLE PRECISION NOT NULL,
--     batch_no VARCHAR NULL,
--     log_date TIMESTAMP,
--     offset_value NUMERIC DEFAULT 1.0/365,
--     offset_id VARCHAR NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE IF NOT EXISTS fractional_offsets (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL,
    farmer_custom_id VARCHAR(100) DEFAULT '',
    farmer_name VARCHAR(255) DEFAULT '',
    aadhar VARCHAR(50),
    mobile_number VARCHAR(20),
    farmer_lat DOUBLE PRECISION,
    farmer_lng DOUBLE PRECISION,
    place VARCHAR(255),
    state VARCHAR(255),
    district VARCHAR(255),
    pincode VARCHAR(50),
    farmer_onboarding_date TIMESTAMP,
    cattle_id VARCHAR(100) DEFAULT '',
    feed_batch_id VARCHAR(100),
    camp_lead_id INTEGER,
    camp_lead_custom_id VARCHAR(100),
    camp_lead_lat DOUBLE PRECISION,
    camp_lead_lng DOUBLE PRECISION,
    log_date TIMESTAMP,
    feed_given VARCHAR,
    fractional_offset_id VARCHAR(100),
    verification_date TIMESTAMP,
    verification_id VARCHAR(100),
    offset_value NUMERIC DEFAULT 1.0/365,
    note TEXT,
    offset_id VARCHAR NULL,
    verified_lat DOUBLE PRECISION,
    verified_lng DOUBLE PRECISION,
    verification_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --9. manufacturers
-- CREATE TABLE IF NOT EXISTS manufacturers (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     muid VARCHAR(50) UNIQUE NOT NULL,
--     location VARCHAR(200),
--     created_by INTEGER,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

--10.batches
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_no VARCHAR(50) UNIQUE NOT NULL,
    manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
    date_of_manufacturing DATE NOT NULL,
    quantity INTEGER NOT NULL,
    created_by VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--11.batch_acknowledgements
CREATE TABLE IF NOT EXISTS batch_acknowledgements (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    camp_lead_id INTEGER REFERENCES camp_leads(id),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12.feed_distribution
CREATE TABLE IF NOT EXISTS feed_distribution (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id),
    farmer_id INTEGER NOT NULL REFERENCES farmers(id),
    quantity INTEGER NOT NULL,
    batch_no VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES camp_leads(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--13. admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--14. offsets
CREATE TABLE IF NOT EXISTS offsets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_fraction NUMERIC DEFAULT 1.0, -- always 1 offset
);

--15. potential_offsets
CREATE TABLE IF NOT EXISTS potential_offsets (
    id SERIAL PRIMARY KEY,
    state VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    potential_offset NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




