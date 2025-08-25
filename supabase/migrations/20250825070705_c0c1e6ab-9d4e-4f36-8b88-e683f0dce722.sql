-- Fix Security Linter Issues

-- Fix Issue 1: Remove SECURITY DEFINER from view and create it as regular view
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

-- Fix Issue 2: Add search_path to functions
CREATE OR REPLACE FUNCTION public.log_admin_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log any role changes, especially to/from admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.admin_security_logs (
      admin_user_id,
      action_type,
      target_user_id,
      action_details,
      security_level
    ) VALUES (
      auth.uid(),
      'role_change',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_email', NEW.email
      ),
      CASE WHEN NEW.role = 'admin' OR OLD.role = 'admin' THEN 'critical' ELSE 'high' END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update admin creation function with proper search path
CREATE OR REPLACE FUNCTION public.create_secure_admin_profile(admin_user_id uuid, admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  current_admin_count integer;
BEGIN
  -- Validate that email is in approved admin list (restrict to single admin)
  IF admin_email != 'diggs844037@yahoo.com' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized admin email - only primary admin allowed');
  END IF;
  
  -- Check current admin count to prevent multiple admins
  SELECT COUNT(*) INTO current_admin_count 
  FROM public.profiles 
  WHERE role = 'admin' AND status = 'active';
  
  -- Allow only one active admin (except for the primary admin email)
  IF current_admin_count > 0 THEN
    -- Check if existing admin is the same email
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE role = 'admin' 
      AND status = 'active' 
      AND email = admin_email
    ) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Only one admin account allowed');
    END IF;
  END IF;
  
  -- Create or update admin profile
  INSERT INTO public.profiles (id, email, role, full_name, status)
  VALUES (admin_user_id, admin_email, 'admin', 'Administrator', 'active')
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    status = 'active',
    updated_at = now();
    
  -- Log the admin creation with high security level
  INSERT INTO public.admin_security_logs (
    admin_user_id,
    action_type,
    target_user_id,
    action_details,
    security_level
  ) VALUES (
    admin_user_id,
    'admin_profile_created',
    admin_user_id,
    jsonb_build_object('email', admin_email, 'method', 'secure_function'),
    'critical'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin profile created successfully');
END;
$$;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS audit_role_changes ON public.profiles;
CREATE TRIGGER audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_role_changes();