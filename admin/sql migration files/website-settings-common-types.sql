-- Website settings migration with common type values
-- Let's try the most common type values used in settings tables

-- Clear existing data
DELETE FROM website_settings;

-- Try with common type values that are typically allowed
INSERT INTO website_settings (key, value, type, description) VALUES
  ('site_name', 'Jet & Keys', 'setting', 'Website name'),
  ('site_description', 'Premium car rental and private jet services', 'setting', 'Website description for SEO'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'setting', 'SEO keywords'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'setting', 'Main hero section title'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'setting', 'Hero section subtitle'),
  ('hero_image', '', 'setting', 'Hero section background image URL'),
  ('about_title', 'About Jet & Keys', 'setting', 'About section title'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'setting', 'About section description'),
  ('about_image', '', 'setting', 'About section image URL'),
  ('contact_email', 'info@jetandkeys.com', 'setting', 'Contact email address'),
  ('contact_phone', '+234 800 000 0000', 'setting', 'Contact phone number'),
  ('contact_address', 'Lagos, Nigeria', 'setting', 'Business address'),
  ('social_facebook', '', 'setting', 'Facebook page URL'),
  ('social_twitter', '', 'setting', 'Twitter profile URL'),
  ('social_instagram', '', 'setting', 'Instagram profile URL'),
  ('social_linkedin', '', 'setting', 'LinkedIn company URL'),
  ('primary_color', '#000000', 'setting', 'Primary brand color'),
  ('secondary_color', '#f97316', 'setting', 'Secondary brand color'),
  ('accent_color', '#fbbf24', 'setting', 'Accent brand color'),
  ('logo_url', '', 'setting', 'Company logo URL'),
  ('favicon_url', '', 'setting', 'Website favicon URL'),
  ('maintenance_mode', 'false', 'setting', 'Enable maintenance mode'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'setting', 'Maintenance mode message'),
  ('google_analytics_id', '', 'setting', 'Google Analytics tracking ID'),
  ('google_maps_api_key', '', 'setting', 'Google Maps API key'),
  ('payment_gateway_public_key', '', 'setting', 'Payment gateway public key'),
  ('payment_gateway_secret_key', '', 'setting', 'Payment gateway secret key'),
  ('email_smtp_host', '', 'setting', 'SMTP server host'),
  ('email_smtp_port', '587', 'setting', 'SMTP server port'),
  ('email_smtp_username', '', 'setting', 'SMTP username'),
  ('email_smtp_password', '', 'setting', 'SMTP password'),
  ('email_from_address', '', 'setting', 'Default from email address'),
  ('email_from_name', '', 'setting', 'Default from name');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(key);

