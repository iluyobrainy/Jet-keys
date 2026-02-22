-- Security Migration Rollback Script
-- This script reverts all changes made by the comprehensive security implementation

-- ==============================================
-- 1. DROP TRIGGERS
-- ==============================================

DROP TRIGGER IF EXISTS audit_cars_trigger ON cars;
DROP TRIGGER IF EXISTS audit_jets_trigger ON jets;
DROP TRIGGER IF EXISTS audit_bookings_trigger ON bookings;
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
DROP TRIGGER IF EXISTS audit_website_settings_trigger ON website_settings;
DROP TRIGGER IF EXISTS audit_checkout_settings_trigger ON checkout_settings;

-- ==============================================
-- 2. DROP FUNCTIONS
-- ==============================================

DROP FUNCTION IF EXISTS log_audit_event();
DROP FUNCTION IF EXISTS log_security_event(TEXT, JSONB);
DROP FUNCTION IF EXISTS cleanup_old_security_events();

-- ==============================================
-- 3. DROP VIEWS
-- ==============================================

DROP VIEW IF EXISTS security_dashboard;
DROP VIEW IF EXISTS recent_audit_logs;

-- ==============================================
-- 4. DROP ALL RLS POLICIES
-- ==============================================

-- Cars policies
DROP POLICY IF EXISTS "public_read_active_cars" ON cars;
DROP POLICY IF EXISTS "admin_full_access_cars" ON cars;
DROP POLICY IF EXISTS "moderator_read_cars" ON cars;

-- Jets policies
DROP POLICY IF EXISTS "public_read_active_jets" ON jets;
DROP POLICY IF EXISTS "admin_full_access_jets" ON jets;
DROP POLICY IF EXISTS "moderator_read_jets" ON jets;

-- Bookings policies
DROP POLICY IF EXISTS "users_create_bookings" ON bookings;
DROP POLICY IF EXISTS "users_view_own_bookings" ON bookings;
DROP POLICY IF EXISTS "users_update_own_bookings" ON bookings;
DROP POLICY IF EXISTS "admin_full_access_bookings" ON bookings;
DROP POLICY IF EXISTS "moderator_read_bookings" ON bookings;

-- Users policies
DROP POLICY IF EXISTS "users_view_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "admin_full_access_users" ON users;
DROP POLICY IF EXISTS "moderator_read_users" ON users;

-- Website settings policies
DROP POLICY IF EXISTS "public_read_website_settings" ON website_settings;
DROP POLICY IF EXISTS "admin_full_access_website_settings" ON website_settings;

-- Checkout settings policies
DROP POLICY IF EXISTS "public_read_checkout_settings" ON checkout_settings;
DROP POLICY IF EXISTS "admin_full_access_checkout_settings" ON checkout_settings;

-- Audit logs policies
DROP POLICY IF EXISTS "admin_only_audit_logs" ON audit_logs;

-- Security events policies
DROP POLICY IF EXISTS "admin_only_security_events" ON security_events;

-- ==============================================
-- 5. DISABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE jets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_settings DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. DROP SECURITY CONSTRAINTS
-- ==============================================

-- Drop constraints that were added
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_phone_format;
ALTER TABLE cars DROP CONSTRAINT IF EXISTS check_price_positive;
ALTER TABLE jets DROP CONSTRAINT IF EXISTS check_jet_price_positive;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_booking_dates;

-- ==============================================
-- 7. DROP SECURITY INDEXES
-- ==============================================

DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_cars_status;
DROP INDEX IF EXISTS idx_cars_available;
DROP INDEX IF EXISTS idx_jets_status;
DROP INDEX IF EXISTS idx_jets_available;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_security_events_type;
DROP INDEX IF EXISTS idx_security_events_ip;
DROP INDEX IF EXISTS idx_security_events_created_at;

-- ==============================================
-- 8. DROP SECURITY TABLES
-- ==============================================

DROP TABLE IF EXISTS security_events;
DROP TABLE IF EXISTS audit_logs;

-- ==============================================
-- 9. RESTORE ORIGINAL USERS TABLE STRUCTURE
-- ==============================================

-- Check if users table has the security columns and remove them
-- First, let's see what columns exist
-- If the users table was modified, we need to restore it to its original state

-- Remove security-related columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS is_active;
ALTER TABLE users DROP COLUMN IF EXISTS last_login;
ALTER TABLE users DROP COLUMN IF EXISTS created_at;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;

-- ==============================================
-- 10. RESTORE ORIGINAL RLS POLICIES (if any existed)
-- ==============================================

-- Re-enable RLS but with original policies
-- Note: This assumes you want to restore to a state before the security migration
-- You may need to adjust these based on your original setup

-- Basic public access policies (if you had them before)
-- Uncomment these if you had basic policies before:

-- CREATE POLICY "Allow public read access to cars" ON cars FOR SELECT USING (true);
-- CREATE POLICY "Allow admin full access to cars" ON cars FOR ALL USING (true);
-- CREATE POLICY "Allow public read access to jets" ON jets FOR SELECT USING (true);
-- CREATE POLICY "Allow admin full access to jets" ON jets FOR ALL USING (true);
-- CREATE POLICY "Allow admin full access to users" ON users FOR ALL USING (true);
-- CREATE POLICY "Allow admin full access to bookings" ON bookings FOR ALL USING (true);
-- CREATE POLICY "Allow admin full access to website_settings" ON website_settings FOR ALL USING (true);
-- CREATE POLICY "Allow admin full access to checkout_settings" ON checkout_settings FOR ALL USING (true);
-- CREATE POLICY "Allow users to create bookings" ON bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow users to view their own bookings" ON bookings FOR SELECT USING (true);

-- ==============================================
-- 11. VERIFICATION
-- ==============================================

-- Check RLS status (should all be disabled)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cars', 'jets', 'bookings', 'users', 'website_settings', 'checkout_settings');

-- Check remaining policies (should be none)
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('cars', 'jets', 'bookings', 'users', 'website_settings', 'checkout_settings', 'audit_logs', 'security_events');

-- ==============================================
-- ROLLBACK COMPLETE
-- ==============================================

SELECT 'Security migration rollback completed successfully!' as status;



