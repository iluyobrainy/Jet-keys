-- Migration script to add late return fee tracking fields to bookings table
-- Run this in your Supabase SQL editor

-- Add late return tracking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS actual_dropoff_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_dropoff_time VARCHAR(10),
ADD COLUMN IF NOT EXISTS late_return_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_return_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_return_reason TEXT,
ADD COLUMN IF NOT EXISTS late_return_processed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS late_return_processed_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS late_return_notification_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS late_return_notification_date TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_actual_dropoff ON bookings(actual_dropoff_date);
CREATE INDEX IF NOT EXISTS idx_bookings_late_return_fee ON bookings(late_return_fee);
CREATE INDEX IF NOT EXISTS idx_bookings_late_return_processed ON bookings(late_return_processed_date);

-- Add a function to automatically calculate late return fees
CREATE OR REPLACE FUNCTION calculate_late_return_fee(
    scheduled_dropoff TIMESTAMP WITH TIME ZONE,
    actual_dropoff TIMESTAMP WITH TIME ZONE,
    late_fee_per_day DECIMAL(10,2)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    hours_late DECIMAL(5,2);
    days_late DECIMAL(5,2);
    calculated_fee DECIMAL(10,2);
BEGIN
    -- Calculate hours late
    hours_late := EXTRACT(EPOCH FROM (actual_dropoff - scheduled_dropoff)) / 3600;
    
    -- If not late, return 0
    IF hours_late <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Calculate days late (round up)
    days_late := CEIL(hours_late / 24);
    
    -- Calculate fee (minimum 1 day charge)
    calculated_fee := GREATEST(days_late, 1) * late_fee_per_day;
    
    RETURN calculated_fee;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to automatically update late return fees when actual_dropoff_date is set
CREATE OR REPLACE FUNCTION update_late_return_fee()
RETURNS TRIGGER AS $$
DECLARE
    late_fee_per_day DECIMAL(10,2);
    calculated_fee DECIMAL(10,2);
BEGIN
    -- Only process if actual_dropoff_date is being set and is different from scheduled
    IF NEW.actual_dropoff_date IS NOT NULL AND NEW.actual_dropoff_date != NEW.dropoff_date THEN
        -- Get the late return fee from checkout_settings
        SELECT late_return_fee INTO late_fee_per_day 
        FROM checkout_settings 
        LIMIT 1;
        
        -- If no late fee configured, use default
        IF late_fee_per_day IS NULL THEN
            late_fee_per_day := 25000; -- Default ₦25,000 per day
        END IF;
        
        -- Calculate the late return fee
        calculated_fee := calculate_late_return_fee(
            NEW.dropoff_date,
            NEW.actual_dropoff_date,
            late_fee_per_day
        );
        
        -- Update the booking with calculated values
        NEW.late_return_fee := calculated_fee;
        NEW.late_return_hours := EXTRACT(EPOCH FROM (NEW.actual_dropoff_date - NEW.dropoff_date)) / 3600;
        
        -- If there's a late fee, mark for notification
        IF calculated_fee > 0 THEN
            NEW.late_return_notification_sent := false;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_late_return_fee ON bookings;
CREATE TRIGGER trigger_update_late_return_fee
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_late_return_fee();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name LIKE '%late%' OR column_name LIKE '%actual%'
ORDER BY column_name;

