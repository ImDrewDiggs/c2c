-- Critical Security Fix 1: Secure Services Table - Remove Public Access to Business Pricing
-- Check and drop existing policies first

DO $$ 
BEGIN
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can view active services' AND tablename = 'services') THEN
        DROP POLICY "Everyone can view active services" ON public.services;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view basic services' AND tablename = 'services') THEN
        DROP POLICY "Authenticated users can view basic services" ON public.services;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all service details' AND tablename = 'services') THEN
        DROP POLICY "Admins can view all service details" ON public.services;
    END IF;
END $$;

-- Create new secure policies for services access
-- Only admins can view all service details including full pricing
CREATE POLICY "Admins can view all service details" 
ON public.services 
FOR SELECT 
TO authenticated
USING (is_admin_by_email());

-- Create public service catalog view with limited pricing information for public access
DROP VIEW IF EXISTS public.public_service_catalog;
CREATE VIEW public.public_service_catalog AS
SELECT 
  id,
  name,
  description,
  category,
  frequency,
  CASE 
    WHEN category = 'single_family' THEN 
      jsonb_build_object(
        'starting_price', LEAST((price::numeric), 50),
        'price_range', 'Starting from $' || LEAST((price::numeric), 50)::text
      )
    WHEN category = 'multi_family' THEN 
      jsonb_build_object(
        'starting_price', LEAST((price::numeric), 15),
        'price_range', 'Per unit starting from $' || LEAST((price::numeric), 15)::text
      )
    ELSE 
      jsonb_build_object(
        'contact_for_pricing', true,
        'price_range', 'Contact for pricing'
      )
  END as public_pricing_info,
  features,
  is_active,
  sort_order
FROM public.services 
WHERE is_active = true;

-- Grant access to public service catalog
GRANT SELECT ON public.public_service_catalog TO anon, authenticated;

-- Critical Security Fix 2: Enhanced Admin Security Logging
-- Create comprehensive security audit logging
CREATE TABLE IF NOT EXISTS public.admin_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  action_details jsonb DEFAULT '{}',
  security_level text DEFAULT 'medium' CHECK (security_level IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin security logs
ALTER TABLE public.admin_security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
DROP POLICY IF EXISTS "Admins can view security logs" ON public.admin_security_logs;
CREATE POLICY "Admins can view security logs" 
ON public.admin_security_logs 
FOR SELECT 
TO authenticated
USING (is_admin_by_email());

-- System can insert security logs (via triggers/functions)
DROP POLICY IF EXISTS "System can insert security logs" ON public.admin_security_logs;
CREATE POLICY "System can insert security logs" 
ON public.admin_security_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);