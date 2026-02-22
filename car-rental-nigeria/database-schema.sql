-- Jet & Keys Database Schema
-- Run this SQL in your Supabase SQL editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    price_per_week DECIMAL(10,2) NOT NULL,
    price_per_month DECIMAL(10,2) NOT NULL,
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')) NOT NULL,
    transmission VARCHAR(20) CHECK (transmission IN ('manual', 'automatic')) NOT NULL,
    seats INTEGER NOT NULL,
    doors INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT true,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jets table
CREATE TABLE IF NOT EXISTS jets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL,
    range INTEGER NOT NULL, -- in kilometers
    max_speed INTEGER NOT NULL, -- in km/h
    description TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT true,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    jet_id UUID REFERENCES jets(id) ON DELETE SET NULL,
    booking_type VARCHAR(10) CHECK (booking_type IN ('car', 'jet')) NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    dropoff_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website settings table
CREATE TABLE IF NOT EXISTS website_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('string', 'number', 'boolean', 'json')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkout settings table
CREATE TABLE IF NOT EXISTS checkout_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vat_percentage DECIMAL(5,2) DEFAULT 7.5,
    service_fee DECIMAL(10,2) DEFAULT 0,
    insurance_fee DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'NGN',
    payment_methods JSONB DEFAULT '["card", "bank_transfer", "cash"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(location);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_available ON cars(is_available);

CREATE INDEX IF NOT EXISTS idx_jets_manufacturer ON jets(manufacturer);
CREATE INDEX IF NOT EXISTS idx_jets_location ON jets(location);
CREATE INDEX IF NOT EXISTS idx_jets_status ON jets(status);
CREATE INDEX IF NOT EXISTS idx_jets_available ON jets(is_available);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_jet_id ON bookings(jet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jets_updated_at BEFORE UPDATE ON jets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_settings_updated_at BEFORE UPDATE ON website_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkout_settings_updated_at BEFORE UPDATE ON checkout_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (email, name, role) VALUES ('admin@jetandkeys.com', 'Admin User', 'admin') ON CONFLICT (email) DO NOTHING;

-- Insert default checkout settings
INSERT INTO checkout_settings (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- Insert default website settings
INSERT INTO website_settings (key, value, type, description) VALUES 
('site_name', 'Jet & Keys', 'string', 'Website name'),
('site_description', 'Premium car rental and private jet services', 'string', 'Website description'),
('contact_email', 'info@jetandkeys.com', 'string', 'Contact email'),
('contact_phone', '+234 800 000 0000', 'string', 'Contact phone'),
('currency', 'NGN', 'string', 'Default currency'),
('default_car_price', '150000', 'number', 'Default car rental price per day'),
('default_jet_price', '500000', 'number', 'Default jet rental price per hour')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE jets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to cars and jets (read-only)
CREATE POLICY "Allow public read access to cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Allow public read access to jets" ON jets FOR SELECT USING (true);

-- Create policies for admin access (full CRUD)
CREATE POLICY "Allow admin full access to cars" ON cars FOR ALL USING (true);
CREATE POLICY "Allow admin full access to jets" ON jets FOR ALL USING (true);
CREATE POLICY "Allow admin full access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow admin full access to bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow admin full access to website_settings" ON website_settings FOR ALL USING (true);
CREATE POLICY "Allow admin full access to checkout_settings" ON checkout_settings FOR ALL USING (true);

-- Create policies for users to manage their own bookings
CREATE POLICY "Allow users to create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to view their own bookings" ON bookings FOR SELECT USING (true);

