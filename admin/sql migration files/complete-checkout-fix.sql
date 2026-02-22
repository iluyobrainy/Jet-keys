-- Complete checkout_settings table fix with all columns
-- Run this in Supabase SQL Editor

-- 1. First, let's see what columns actually exist
SELECT 'Current checkout_settings structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'checkout_settings'
ORDER BY ordinal_position;

-- 2. Check current data
SELECT 'Current checkout_settings data:' as info;
SELECT * FROM checkout_settings;

-- 3. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add insurance_fee if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='insurance_fee') THEN
        ALTER TABLE checkout_settings ADD COLUMN insurance_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add late_return_fee if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='late_return_fee') THEN
        ALTER TABLE checkout_settings ADD COLUMN late_return_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add cancellation_fee_rate if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='cancellation_fee_rate') THEN
        ALTER TABLE checkout_settings ADD COLUMN cancellation_fee_rate DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Add minimum_rental_hours if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='minimum_rental_hours') THEN
        ALTER TABLE checkout_settings ADD COLUMN minimum_rental_hours INTEGER DEFAULT 4;
    END IF;
    
    -- Add maximum_rental_days if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='maximum_rental_days') THEN
        ALTER TABLE checkout_settings ADD COLUMN maximum_rental_days INTEGER DEFAULT 30;
    END IF;
    
    -- Add advance_booking_days if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='advance_booking_days') THEN
        ALTER TABLE checkout_settings ADD COLUMN advance_booking_days INTEGER DEFAULT 7;
    END IF;
    
    -- Add terms_and_conditions if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='terms_and_conditions') THEN
        ALTER TABLE checkout_settings ADD COLUMN terms_and_conditions TEXT DEFAULT '';
    END IF;
    
    -- Add privacy_policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='privacy_policy') THEN
        ALTER TABLE checkout_settings ADD COLUMN privacy_policy TEXT DEFAULT '';
    END IF;
    
    -- Add refund_policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='refund_policy') THEN
        ALTER TABLE checkout_settings ADD COLUMN refund_policy TEXT DEFAULT '';
    END IF;
    
    -- Add contact_email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='contact_email') THEN
        ALTER TABLE checkout_settings ADD COLUMN contact_email VARCHAR(255) DEFAULT '';
    END IF;
    
    -- Add contact_phone if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='contact_phone') THEN
        ALTER TABLE checkout_settings ADD COLUMN contact_phone VARCHAR(50) DEFAULT '';
    END IF;
    
    -- Add business_address if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkout_settings' AND column_name='business_address') THEN
        ALTER TABLE checkout_settings ADD COLUMN business_address TEXT DEFAULT '';
    END IF;
END $$;

-- 4. Show updated structure
SELECT 'Updated checkout_settings structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'checkout_settings'
ORDER BY ordinal_position;

-- 5. Enable RLS if not enabled
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on checkout_settings" ON checkout_settings;
CREATE POLICY "Allow all operations on checkout_settings" ON checkout_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Clear existing data
DELETE FROM checkout_settings;

-- 8. Insert complete configuration
INSERT INTO checkout_settings (
  vat_rate,
  service_fee_rate,
  delivery_fee,
  insurance_fee,
  late_return_fee,
  cancellation_fee_rate,
  minimum_rental_hours,
  maximum_rental_days,
  advance_booking_days,
  payment_methods,
  currency,
  terms_and_conditions,
  privacy_policy,
  refund_policy,
  contact_email,
  contact_phone,
  business_address,
  created_at,
  updated_at
) VALUES (
  7.5,   -- vat_rate
  2.5,   -- service_fee_rate
  10000, -- delivery_fee
  5000,  -- insurance_fee
  25000, -- late_return_fee
  10,    -- cancellation_fee_rate
  4,     -- minimum_rental_hours
  30,    -- maximum_rental_days
  7,     -- advance_booking_days
  '["card", "bank_transfer", "cash"]'::jsonb, -- payment_methods
  'NGN', -- currency
  '',    -- terms_and_conditions
  '',    -- privacy_policy
  '',    -- refund_policy
  '',    -- contact_email
  '',    -- contact_phone
  '',    -- business_address
  NOW(), -- created_at
  NOW()  -- updated_at
);

-- 9. Verify the data
SELECT 'Final checkout_settings data:' as info;
SELECT * FROM checkout_settings;

