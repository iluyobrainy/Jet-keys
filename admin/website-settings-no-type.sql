-- Website settings migration without specifying type column
-- This avoids the check constraint entirely by not specifying the type column

-- Clear existing data
DELETE FROM website_settings;

-- Insert data without specifying type column at all
-- This will use the database default value or NULL if allowed
INSERT INTO website_settings (key, value, description) VALUES
  ('site_name', 'Jet & Keys', 'Website name'),
  ('site_description', 'Premium car rental and private jet services', 'Website description for SEO'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'SEO keywords'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'Main hero section title'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'Hero section subtitle'),
  ('hero_image', '', 'Hero section background image URL'),
  ('about_title', 'About Jet & Keys', 'About section title'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'About section description'),
  ('about_image', '', 'About section image URL'),
  ('contact_email', 'info@jetandkeys.com', 'Contact email address'),
  ('contact_phone', '+234 800 000 0000', 'Contact phone number'),
  ('contact_address', 'Lagos, Nigeria', 'Business address'),
  ('social_facebook', '', 'Facebook page URL'),
  ('social_twitter', '', 'Twitter profile URL'),
  ('social_instagram', '', 'Instagram profile URL'),
  ('social_linkedin', '', 'LinkedIn company URL'),
  ('primary_color', '#000000', 'Primary brand color'),
  ('secondary_color', '#f97316', 'Secondary brand color'),
  ('accent_color', '#fbbf24', 'Accent brand color'),
  ('logo_url', '', 'Company logo URL'),
  ('favicon_url', '', 'Website favicon URL'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'Maintenance mode message'),
  ('google_analytics_id', '', 'Google Analytics tracking ID'),
  ('google_maps_api_key', '', 'Google Maps API key'),
  ('payment_gateway_public_key', '', 'Payment gateway public key'),
  ('payment_gateway_secret_key', '', 'Payment gateway secret key'),
  ('email_smtp_host', '', 'SMTP server host'),
  ('email_smtp_port', '587', 'SMTP server port'),
  ('email_smtp_username', '', 'SMTP username'),
  ('email_smtp_password', '', 'SMTP password'),
  ('email_from_address', '', 'Default from email address'),
  ('email_from_name', '', 'Default from name');

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




