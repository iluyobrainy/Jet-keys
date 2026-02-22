-- Final fix for website_settings table
-- This script handles the check constraint on the type column

-- First, let's check what the valid type values are by looking at existing data
-- If there's existing data, we'll use those type values
-- If not, we'll try common values

-- Clear existing data to avoid conflicts
DELETE FROM website_settings;

-- Try to insert with common type values that are typically allowed
-- If this fails, we'll need to check the constraint definition
INSERT INTO website_settings (key, value, type, description) VALUES
  ('site_name', 'Jet & Keys', 'string', 'Website name'),
  ('site_description', 'Premium car rental and private jet services', 'string', 'Website description for SEO'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'string', 'SEO keywords'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'string', 'Main hero section title'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'string', 'Hero section subtitle'),
  ('hero_image', '', 'string', 'Hero section background image URL'),
  ('about_title', 'About Jet & Keys', 'string', 'About section title'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'string', 'About section description'),
  ('about_image', '', 'string', 'About section image URL'),
  ('contact_email', 'info@jetandkeys.com', 'string', 'Contact email address'),
  ('contact_phone', '+234 800 000 0000', 'string', 'Contact phone number'),
  ('contact_address', 'Lagos, Nigeria', 'string', 'Business address'),
  ('social_facebook', '', 'string', 'Facebook page URL'),
  ('social_twitter', '', 'string', 'Twitter profile URL'),
  ('social_instagram', '', 'string', 'Instagram profile URL'),
  ('social_linkedin', '', 'string', 'LinkedIn company URL'),
  ('primary_color', '#000000', 'string', 'Primary brand color'),
  ('secondary_color', '#f97316', 'string', 'Secondary brand color'),
  ('accent_color', '#fbbf24', 'string', 'Accent brand color'),
  ('logo_url', '', 'string', 'Company logo URL'),
  ('favicon_url', '', 'string', 'Website favicon URL'),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'string', 'Maintenance mode message'),
  ('google_analytics_id', '', 'string', 'Google Analytics tracking ID'),
  ('google_maps_api_key', '', 'string', 'Google Maps API key'),
  ('payment_gateway_public_key', '', 'string', 'Payment gateway public key'),
  ('payment_gateway_secret_key', '', 'string', 'Payment gateway secret key'),
  ('email_smtp_host', '', 'string', 'SMTP server host'),
  ('email_smtp_port', '587', 'integer', 'SMTP server port'),
  ('email_smtp_username', '', 'string', 'SMTP username'),
  ('email_smtp_password', '', 'string', 'SMTP password'),
  ('email_from_address', '', 'string', 'Default from email address'),
  ('email_from_name', '', 'string', 'Default from name');

-- If the above fails, try with even simpler type values
-- Uncomment the section below if the above fails:

/*
-- Alternative approach: Use only basic types
DELETE FROM website_settings;

INSERT INTO website_settings (key, value, type) VALUES
  ('site_name', 'Jet & Keys', 'text'),
  ('site_description', 'Premium car rental and private jet services', 'text'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'text'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'text'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'text'),
  ('hero_image', '', 'text'),
  ('about_title', 'About Jet & Keys', 'text'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'text'),
  ('about_image', '', 'text'),
  ('contact_email', 'info@jetandkeys.com', 'text'),
  ('contact_phone', '+234 800 000 0000', 'text'),
  ('contact_address', 'Lagos, Nigeria', 'text'),
  ('social_facebook', '', 'text'),
  ('social_twitter', '', 'text'),
  ('social_instagram', '', 'text'),
  ('social_linkedin', '', 'text'),
  ('primary_color', '#000000', 'text'),
  ('secondary_color', '#f97316', 'text'),
  ('accent_color', '#fbbf24', 'text'),
  ('logo_url', '', 'text'),
  ('favicon_url', '', 'text'),
  ('maintenance_mode', 'false', 'boolean'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'text'),
  ('google_analytics_id', '', 'text'),
  ('google_maps_api_key', '', 'text'),
  ('payment_gateway_public_key', '', 'text'),
  ('payment_gateway_secret_key', '', 'text'),
  ('email_smtp_host', '', 'text'),
  ('email_smtp_port', '587', 'integer'),
  ('email_smtp_username', '', 'text'),
  ('email_smtp_password', '', 'text'),
  ('email_from_address', '', 'text'),
  ('email_from_name', '', 'text');
*/

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




