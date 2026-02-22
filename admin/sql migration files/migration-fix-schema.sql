-- Migration script to fix bookings table and checkout_settings table
-- Run this in your Supabase SQL editor

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(10),
ADD COLUMN IF NOT EXISTS dropoff_time VARCHAR(10);

-- Update checkout_settings table to match our code expectations
-- First, let's check what columns exist and add missing ones
ALTER TABLE checkout_settings 
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee_rate DECIMAL(5,2) DEFAULT 0;

-- Update existing data to use the new column names
-- Copy vat_percentage to vat_rate if it exists
UPDATE checkout_settings 
SET vat_rate = COALESCE(vat_percentage, 0) 
WHERE vat_rate IS NULL;

-- Copy service_fee to service_fee_rate if it exists  
UPDATE checkout_settings 
SET service_fee_rate = COALESCE(service_fee, 0) 
WHERE service_fee_rate IS NULL;

-- Insert default checkout settings if none exist
INSERT INTO checkout_settings (id, delivery_fee, vat_rate, service_fee_rate) 
VALUES (uuid_generate_v4(), 20000, 7.5, 2.5) 
ON CONFLICT DO NOTHING;

-- Verify the changes
SELECT * FROM checkout_settings;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('delivery_fee', 'vat_amount', 'service_fee', 'pickup_time', 'dropoff_time');
