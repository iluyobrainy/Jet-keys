-- Check and fix checkout_settings table
-- Run this in Supabase SQL Editor

-- 1. Check if table exists and has data
SELECT * FROM checkout_settings;

-- 2. If empty, insert the default configuration
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
) ON CONFLICT DO NOTHING;

-- 3. Verify the data was inserted
SELECT * FROM checkout_settings;




