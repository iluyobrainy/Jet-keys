-- Add website settings without clearing existing data
-- This will use the same type values as existing records

-- Don't clear existing data, just add our new settings
-- Use the same type values that are already in the table

-- Insert data using the same type values as existing records
-- Let's try to match what's already there
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
  ('email_smtp_port', '587', 'number', 'SMTP server port'),
  ('email_smtp_username', '', 'string', 'SMTP username'),
  ('email_smtp_password', '', 'string', 'SMTP password'),
  ('email_from_address', '', 'string', 'Default from email address'),
  ('email_from_name', '', 'string', 'Default from name')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(key);




