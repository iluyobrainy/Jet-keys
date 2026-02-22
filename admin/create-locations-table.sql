-- Create locations table for pickup/dropoff locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active locations
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Create index for city/state searches
CREATE INDEX IF NOT EXISTS idx_locations_city_state ON locations(city, state);

-- Insert some default locations for Nigeria (Lagos first)
INSERT INTO locations (name, address, city, state, is_active) VALUES
('Lagos Airport', 'Murtala Muhammed International Airport, Ikeja', 'Lagos', 'Lagos', true),
('Victoria Island', 'Victoria Island Business District', 'Lagos', 'Lagos', true),
('Ikoyi', 'Ikoyi Residential Area', 'Lagos', 'Lagos', true),
('Abuja Airport', 'Nnamdi Azikiwe International Airport', 'Abuja', 'FCT', true),
('Abuja City Center', 'Central Business District, Abuja', 'Abuja', 'FCT', true),
('Port Harcourt Airport', 'Port Harcourt International Airport', 'Port Harcourt', 'Rivers', true),
('Kano Airport', 'Mallam Aminu Kano International Airport', 'Kano', 'Kano', true),
('Ibadan City Center', 'Central Business District, Ibadan', 'Ibadan', 'Oyo', true),
('Enugu Airport', 'Akanu Ibiam International Airport', 'Enugu', 'Enugu', true),
('Kaduna City Center', 'Central Business District, Kaduna', 'Kaduna', 'Kaduna', true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
