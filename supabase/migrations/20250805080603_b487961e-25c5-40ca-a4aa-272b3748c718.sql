-- Create site_settings table for global site configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create services table for managing service offerings and pricing
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly',
  category text NOT NULL DEFAULT 'single_family',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings (admin only)
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin_by_email());

-- Create policies for services
CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (is_admin_by_email());

CREATE POLICY "Everyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
('company_name', '"Waste Management Solutions"', 'general', 'Company name displayed across the application'),
('contact_email', '"contact@wastemgmt.example.com"', 'general', 'Primary contact email'),
('contact_phone', '"(555) 123-4567"', 'general', 'Primary contact phone number'),
('business_address', '"123 Recycle Blvd, Green City, GC 12345"', 'general', 'Business address'),
('auto_assign_pickups', 'true', 'system', 'Automatically assign pickups to employees'),
('enable_notifications', 'true', 'system', 'Enable customer notifications'),
('maintenance_mode', 'false', 'system', 'System maintenance mode'),
('primary_color', '"#6E59A5"', 'appearance', 'Primary brand color'),
('secondary_color', '"#9b87f5"', 'appearance', 'Secondary brand color'),
('enable_dark_mode', 'false', 'appearance', 'Enable dark mode by default'),
('pickup_reminders', 'true', 'notifications', 'Send pickup reminder emails'),
('employee_assignments', 'true', 'notifications', 'Notify employees of assignments'),
('payment_receipts', 'true', 'notifications', 'Send payment receipt emails'),
('two_factor_auth', 'true', 'security', 'Require two-factor authentication'),
('session_timeout', '30', 'security', 'Session timeout in minutes'),
('password_policy', 'true', 'security', 'Enforce strong password requirements');

-- Insert default services
INSERT INTO public.services (name, description, price, frequency, category, features) VALUES
('Basic', 'Perfect for small households', 29.99, 'monthly', 'single_family', '["Weekly pickup", "One bin", "Customer support"]'::jsonb),
('Standard', 'Best value for families', 49.99, 'monthly', 'single_family', '["Twice weekly pickup", "Two bins", "Priority support", "Recycling included"]'::jsonb),
('Premium', 'Complete waste management', 79.99, 'monthly', 'single_family', '["Three times weekly pickup", "Multiple bins", "24/7 Premium support", "Recycling & composting"]'::jsonb),
('Small Complex', 'For small apartment buildings', 199.99, 'monthly', 'multi_family', '["Daily pickup", "Up to 10 units", "Dedicated account manager"]'::jsonb),
('Medium Complex', 'For medium-sized complexes', 399.99, 'monthly', 'multi_family', '["Twice daily pickup", "Up to 50 units", "Dedicated account manager", "Bulk item pickup"]'::jsonb),
('Large Complex', 'For large residential complexes', 799.99, 'monthly', 'multi_family', '["Custom schedule", "Unlimited units", "24/7 service", "Full waste management"]'::jsonb),
('Small Business', 'For small commercial operations', 149.99, 'monthly', 'commercial', '["Daily pickup", "Up to 3 bins", "Business support"]'::jsonb),
('Medium Business', 'For growing businesses', 299.99, 'monthly', 'commercial', '["Custom schedule", "Up to 10 bins", "Dedicated manager"]'::jsonb),
('Enterprise', 'For large commercial operations', 999.99, 'monthly', 'commercial', '["24/7 service", "Unlimited bins", "Full waste management"]'::jsonb);