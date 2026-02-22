-- Simple fix for checkout_settings table (using only existing columns)
-- Run this in Supabase SQL Editor

-- 1. Check current table structure
SELECT 'Current checkout_settings structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'checkout_settings';

-- 2. Check current data
SELECT 'Current checkout_settings data:' as info;
SELECT * FROM checkout_settings;

-- 3. Enable RLS if not enabled
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations on checkout_settings" ON checkout_settings;
CREATE POLICY "Allow all operations on checkout_settings" ON checkout_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Clear existing data
DELETE FROM checkout_settings;

-- 6. Insert only the basic configuration (using existing columns)
INSERT INTO checkout_settings (
  vat_rate,
  service_fee_rate,
  delivery_fee,
  currency,
  payment_methods,
  created_at,
  updated_at
) VALUES (
  7.5,  -- vat_rate
  2.5,  -- service_fee_rate
  10000, -- delivery_fee (your configured value)
  'NGN', -- currency
  '["card", "bank_transfer", "cash"]'::jsonb, -- payment_methods
  NOW(), -- created_at
  NOW()  -- updated_at
);

-- 7. Verify the data
SELECT 'After insert - checkout_settings data:' as info;
SELECT * FROM checkout_settings;

-- 8. Test the API endpoint
SELECT 'Testing API access:' as info;
SELECT 
  delivery_fee,
  vat_rate,
  service_fee_rate,
  currency
FROM checkout_settings;




