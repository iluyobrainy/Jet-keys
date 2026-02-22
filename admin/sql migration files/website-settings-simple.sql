-- Simple approach: Insert data without specifying type column
-- This will use the default value for type or NULL if allowed

-- Clear existing data
DELETE FROM website_settings;

-- Insert data without type column (let database handle defaults)
INSERT INTO website_settings (key, value) VALUES
  ('site_name', 'Jet & Keys'),
  ('site_description', 'Premium car rental and private jet services'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria'),
  ('hero_title', 'Premium Car Rental & Private Jet Services'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability'),
  ('hero_image', ''),
  ('about_title', 'About Jet & Keys'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.'),
  ('about_image', ''),
  ('contact_email', 'info@jetandkeys.com'),
  ('contact_phone', '+234 800 000 0000'),
  ('contact_address', 'Lagos, Nigeria'),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('social_instagram', ''),
  ('social_linkedin', ''),
  ('primary_color', '#000000'),
  ('secondary_color', '#f97316'),
  ('accent_color', '#fbbf24'),
  ('logo_url', ''),
  ('favicon_url', ''),
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.'),
  ('google_analytics_id', ''),
  ('google_maps_api_key', ''),
  ('payment_gateway_public_key', ''),
  ('payment_gateway_secret_key', ''),
  ('email_smtp_host', ''),
  ('email_smtp_port', '587'),
  ('email_smtp_username', ''),
  ('email_smtp_password', ''),
  ('email_from_address', ''),
  ('email_from_name', '');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(key);

