-- Comprehensive fix for checkout_settings table
-- Run this in Supabase SQL Editor

-- 1. Check current state
SELECT 'Current checkout_settings data:' as info;
SELECT * FROM checkout_settings;

-- 2. Enable RLS if not enabled
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy to allow all operations (for now)
DROP POLICY IF EXISTS "Allow all operations on checkout_settings" ON checkout_settings;
CREATE POLICY "Allow all operations on checkout_settings" ON checkout_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Clear existing data and insert fresh
DELETE FROM checkout_settings;

-- 5. Insert the correct configuration
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
  7.5,  -- vat_rate
  2.5,  -- service_fee_rate
  10000, -- delivery_fee (your configured value)
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

-- 6. Verify the data
SELECT 'After insert - checkout_settings data:' as info;
SELECT * FROM checkout_settings;

-- 7. Test the API endpoint
SELECT 'Testing API access:' as info;
SELECT 
  delivery_fee,
  vat_rate,
  service_fee_rate,
  currency
FROM checkout_settings;




