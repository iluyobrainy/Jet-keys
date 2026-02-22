-- Fix website_settings table structure and data
-- This script handles the existing table with the 'type' column

-- First, let's check if the table exists and what columns it has
-- If the table doesn't exist, create it with the correct structure
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'website_settings' 
    AND policyname = 'Enable all operations for website_settings'
  ) THEN
    CREATE POLICY "Enable all operations for website_settings" ON website_settings
      FOR ALL USING (true);
  END IF;
END $$;

-- Clear existing data to avoid conflicts
DELETE FROM website_settings;

-- Insert default website settings with proper type values
INSERT INTO website_settings (key, value, type, description) VALUES
  ('site_name', 'Jet & Keys', 'text', 'Website name'),
  ('site_description', 'Premium car rental and private jet services', 'text', 'Website description for SEO'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'text', 'SEO keywords'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'text', 'Main hero section title'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'text', 'Hero section subtitle'),
  ('hero_image', '', 'url', 'Hero section background image URL'),
  ('about_title', 'About Jet & Keys', 'text', 'About section title'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'text', 'About section description'),
  ('about_image', '', 'url', 'About section image URL'),
  ('contact_email', 'info@jetandkeys.com', 'email', 'Contact email address'),
  ('contact_phone', '+234 800 000 0000', 'text', 'Contact phone number'),
  ('contact_address', 'Lagos, Nigeria', 'text', 'Business address'),
  ('social_facebook', '', 'url', 'Facebook page URL'),
  ('social_twitter', '', 'url', 'Twitter profile URL'),
  ('social_instagram', '', 'url', 'Instagram profile URL'),
  ('social_linkedin', '', 'url', 'LinkedIn company URL'),
  ('primary_color', '#000000', 'color', 'Primary brand color'),
  ('secondary_color', '#f97316', 'color', 'Secondary brand color'),
  ('accent_color', '#fbbf24', 'color', 'Accent brand color'),
  ('logo_url', '', 'url', 'Company logo URL'),
  ('favicon_url', '', 'url', 'Website favicon URL'),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'text', 'Maintenance mode message'),
  ('google_analytics_id', '', 'text', 'Google Analytics tracking ID'),
  ('google_maps_api_key', '', 'text', 'Google Maps API key'),
  ('payment_gateway_public_key', '', 'text', 'Payment gateway public key'),
  ('payment_gateway_secret_key', '', 'text', 'Payment gateway secret key'),
  ('email_smtp_host', '', 'text', 'SMTP server host'),
  ('email_smtp_port', '587', 'number', 'SMTP server port'),
  ('email_smtp_username', '', 'text', 'SMTP username'),
  ('email_smtp_password', '', 'password', 'SMTP password'),
  ('email_from_address', '', 'email', 'Default from email address'),
  ('email_from_name', '', 'text', 'Default from name');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(key);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_website_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_website_settings_updated_at ON website_settings;
CREATE TRIGGER update_website_settings_updated_at
  BEFORE UPDATE ON website_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_website_settings_updated_at();




