-- Add structured address fields to caregivers table
ALTER TABLE caregivers 
ADD COLUMN street_address VARCHAR(255),
ADD COLUMN unit_number VARCHAR(20),
ADD COLUMN postal_code VARCHAR(10),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add indexes for better query performance
CREATE INDEX idx_caregivers_postal_code ON caregivers(postal_code);
CREATE INDEX idx_caregivers_city ON caregivers(city);
CREATE INDEX idx_caregivers_location ON caregivers(latitude, longitude);

-- Add the same fields to elders table for consistency
ALTER TABLE elders 
ADD COLUMN street_address VARCHAR(255),
ADD COLUMN unit_number VARCHAR(20),
ADD COLUMN postal_code VARCHAR(10),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add indexes for elders table
CREATE INDEX idx_elders_postal_code ON elders(postal_code);
CREATE INDEX idx_elders_city ON elders(city);
CREATE INDEX idx_elders_location ON elders(latitude, longitude); 