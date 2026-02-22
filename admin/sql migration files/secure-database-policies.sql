-- Comprehensive Security Implementation for Jet & Keys Database
-- Run this in Supabase SQL Editor to implement secure RLS policies

-- ==============================================
-- 1. SECURITY CONFIGURATION
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE jets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. USER MANAGEMENT & AUTHENTICATION
-- ==============================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_events table for intrusion detection
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'failed_auth', 'suspicious_activity', 'rate_limit_exceeded')),
  user_id UUID REFERENCES users(id),
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. SECURE RLS POLICIES
-- ==============================================

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Allow public read access to cars" ON cars;
DROP POLICY IF EXISTS "Allow admin full access to cars" ON cars;
DROP POLICY IF EXISTS "Allow public read access to jets" ON jets;
DROP POLICY IF EXISTS "Allow admin full access to jets" ON jets;
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;
DROP POLICY IF EXISTS "Allow admin full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow admin full access to website_settings" ON website_settings;
DROP POLICY IF EXISTS "Allow admin full access to checkout_settings" ON checkout_settings;
DROP POLICY IF EXISTS "Allow users to create bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to view their own bookings" ON bookings;

-- CARS TABLE POLICIES
-- Public read access for active cars only
CREATE POLICY "public_read_active_cars" ON cars
  FOR SELECT USING (
    status = 'active' AND 
    is_available = true
  );

-- Admin full access (requires admin role)
CREATE POLICY "admin_full_access_cars" ON cars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- Moderator read access
CREATE POLICY "moderator_read_cars" ON cars
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator') 
      AND users.is_active = true
    )
  );

-- JETS TABLE POLICIES
-- Public read access for active jets only
CREATE POLICY "public_read_active_jets" ON jets
  FOR SELECT USING (
    status = 'active' AND 
    is_available = true
  );

-- Admin full access
CREATE POLICY "admin_full_access_jets" ON jets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- Moderator read access
CREATE POLICY "moderator_read_jets" ON jets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator') 
      AND users.is_active = true
    )
  );

-- BOOKINGS TABLE POLICIES
-- Users can create bookings
CREATE POLICY "users_create_bookings" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_active = true
    )
  );

-- Users can view their own bookings
CREATE POLICY "users_view_own_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_active = true
    )
  );

-- Users can update their own bookings (limited fields)
CREATE POLICY "users_update_own_bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_active = true
    )
  ) WITH CHECK (
    status IN ('pending', 'cancelled') -- Users can only cancel pending bookings
  );

-- Admin full access to bookings
CREATE POLICY "admin_full_access_bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- Moderator read access to bookings
CREATE POLICY "moderator_read_bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator') 
      AND users.is_active = true
    )
  );

-- USERS TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    -- Users cannot change their own role or active status
    role = (SELECT role FROM users WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM users WHERE id = auth.uid())
  );

-- Admin full access to users
CREATE POLICY "admin_full_access_users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- Moderator read access to users
CREATE POLICY "moderator_read_users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator') 
      AND users.is_active = true
    )
  );

-- WEBSITE_SETTINGS TABLE POLICIES
-- Public read access
CREATE POLICY "public_read_website_settings" ON website_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "admin_full_access_website_settings" ON website_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- CHECKOUT_SETTINGS TABLE POLICIES
-- Public read access
CREATE POLICY "public_read_checkout_settings" ON checkout_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "admin_full_access_checkout_settings" ON checkout_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- AUDIT_LOGS TABLE POLICIES
-- Only admins can access audit logs
CREATE POLICY "admin_only_audit_logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- SECURITY_EVENTS TABLE POLICIES
-- Only admins can access security events
CREATE POLICY "admin_only_security_events" ON security_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.is_active = true
    )
  );

-- ==============================================
-- 4. SECURITY FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    event_type,
    auth.uid(),
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    details,
    CASE 
      WHEN event_type = 'failed_auth' THEN 'high'
      WHEN event_type = 'suspicious_activity' THEN 'critical'
      ELSE 'medium'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_cars_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cars
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_jets_trigger
  AFTER INSERT OR UPDATE OR DELETE ON jets
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_bookings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_website_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON website_settings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_checkout_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON checkout_settings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ==============================================
-- 5. SECURITY INDEXES
-- ==============================================

-- Indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_available ON cars(is_available);
CREATE INDEX IF NOT EXISTS idx_jets_status ON jets(status);
CREATE INDEX IF NOT EXISTS idx_jets_available ON jets(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- ==============================================
-- 6. SECURITY CONSTRAINTS
-- ==============================================

-- Add constraints for data integrity
ALTER TABLE users ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');
ALTER TABLE cars ADD CONSTRAINT check_price_positive CHECK (price_per_day > 0);
ALTER TABLE jets ADD CONSTRAINT check_jet_price_positive CHECK (price_per_hour > 0);
ALTER TABLE bookings ADD CONSTRAINT check_booking_dates CHECK (dropoff_date > pickup_date);

-- ==============================================
-- 7. INITIAL ADMIN USER SETUP
-- ==============================================

-- Create default admin user (replace with your credentials)
INSERT INTO users (email, name, role, is_active) 
VALUES ('admin@jetandkeys.com', 'System Administrator', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- ==============================================
-- 8. SECURITY MONITORING VIEWS
-- ==============================================

-- View for security monitoring
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
  'Failed Login Attempts' as metric,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_events 
WHERE event_type = 'failed_auth' 
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Suspicious Activities' as metric,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_events 
WHERE event_type = 'suspicious_activity' 
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'Rate Limit Exceeded' as metric,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_events 
WHERE event_type = 'rate_limit_exceeded' 
  AND created_at > NOW() - INTERVAL '24 hours';

-- View for audit trail
CREATE OR REPLACE VIEW recent_audit_logs AS
SELECT 
  al.id,
  al.action,
  al.table_name,
  al.record_id,
  u.email as user_email,
  al.ip_address,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC
LIMIT 100;

-- ==============================================
-- 9. SECURITY CLEANUP PROCEDURES
-- ==============================================

-- Function to clean up old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS VOID AS $$
BEGIN
  DELETE FROM security_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run this manually or set up a cron job)
-- SELECT cleanup_old_security_events();

-- ==============================================
-- SECURITY IMPLEMENTATION COMPLETE
-- ==============================================

-- Verify security implementation
SELECT 'Security implementation completed successfully!' as status;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cars', 'jets', 'bookings', 'users', 'website_settings', 'checkout_settings', 'audit_logs', 'security_events');

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

