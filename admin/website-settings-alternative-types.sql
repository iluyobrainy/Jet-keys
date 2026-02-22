-- Alternative website settings migration with different type values
-- If 'setting' doesn't work, try these alternatives

-- Clear existing data
DELETE FROM website_settings;

-- Alternative 1: Try 'config' as type
INSERT INTO website_settings (key, value, type, description) VALUES
  ('site_name', 'Jet & Keys', 'config', 'Website name'),
  ('site_description', 'Premium car rental and private jet services', 'config', 'Website description for SEO'),
  ('site_keywords', 'car rental, jet charter, luxury transportation, nigeria', 'config', 'SEO keywords'),
  ('hero_title', 'Premium Car Rental & Private Jet Services', 'config', 'Main hero section title'),
  ('hero_subtitle', 'Experience luxury transportation with unmatched quality and reliability', 'config', 'Hero section subtitle'),
  ('hero_image', '', 'config', 'Hero section background image URL'),
  ('about_title', 'About Jet & Keys', 'config', 'About section title'),
  ('about_description', 'We provide premium car rental and private jet services with unmatched quality and reliability.', 'config', 'About section description'),
  ('about_image', '', 'config', 'About section image URL'),
  ('contact_email', 'info@jetandkeys.com', 'config', 'Contact email address'),
  ('contact_phone', '+234 800 000 0000', 'config', 'Contact phone number'),
  ('contact_address', 'Lagos, Nigeria', 'config', 'Business address'),
  ('social_facebook', '', 'config', 'Facebook page URL'),
  ('social_twitter', '', 'config', 'Twitter profile URL'),
  ('social_instagram', '', 'config', 'Instagram profile URL'),
  ('social_linkedin', '', 'config', 'LinkedIn company URL'),
  ('primary_color', '#000000', 'config', 'Primary brand color'),
  ('secondary_color', '#f97316', 'config', 'Secondary brand color'),
  ('accent_color', '#fbbf24', 'config', 'Accent brand color'),
  ('logo_url', '', 'config', 'Company logo URL'),
  ('favicon_url', '', 'config', 'Website favicon URL'),
  ('maintenance_mode', 'false', 'config', 'Enable maintenance mode'),
  ('maintenance_message', 'We''re currently performing maintenance. Please check back later.', 'config', 'Maintenance mode message'),
  ('google_analytics_id', '', 'config', 'Google Analytics tracking ID'),
  ('google_maps_api_key', '', 'config', 'Google Maps API key'),
  ('payment_gateway_public_key', '', 'config', 'Payment gateway public key'),
  ('payment_gateway_secret_key', '', 'config', 'Payment gateway secret key'),
  ('email_smtp_host', '', 'config', 'SMTP server host'),
  ('email_smtp_port', '587', 'config', 'SMTP server port'),
  ('email_smtp_username', '', 'config', 'SMTP username'),
  ('email_smtp_password', '', 'config', 'SMTP password'),
  ('email_from_address', '', 'config', 'Default from email address'),
  ('email_from_name', '', 'config', 'Default from name');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(key);




