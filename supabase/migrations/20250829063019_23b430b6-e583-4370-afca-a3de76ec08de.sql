-- CRITICAL SECURITY FIX: Add RLS policies to public_service_catalog table
-- This table currently exposes business intelligence without proper access controls

-- Enable RLS on public_service_catalog table
ALTER TABLE public.public_service_catalog ENABLE ROW LEVEL SECURITY;

-- Only admins can view service catalog details (protects business intelligence)
CREATE POLICY "Admins can view service catalog"
ON public.public_service_catalog
FOR SELECT
USING (is_admin_by_email());

-- Only admins can manage service catalog
CREATE POLICY "Admins can manage service catalog" 
ON public.public_service_catalog
FOR ALL
USING (is_admin_by_email());

-- ADMIN SECURITY: Update admin function to only allow primary admin email
-- Remove secondary admin email for security consolidation
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY: Restrict to single admin email only
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid())) = 'diggs844037@yahoo.com';
END;
$function$;

-- Update secure admin profile function to only allow primary admin
CREATE OR REPLACE FUNCTION public.create_secure_admin_profile(admin_user_id uuid, admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  current_admin_count integer;
BEGIN
  -- SECURITY: Validate that email is the single authorized admin
  IF admin_email != 'diggs844037@yahoo.com' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized admin email - only primary admin allowed');
  END IF;
  
  -- Check current admin count to prevent multiple admins
  SELECT COUNT(*) INTO current_admin_count 
  FROM public.profiles 
  WHERE role = 'admin' AND status = 'active' AND email != admin_email;
  
  -- Block creation if other admin accounts exist
  IF current_admin_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Multiple admin accounts detected - security violation');
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
    
  -- Log the admin creation with critical security level
  INSERT INTO public.admin_security_logs (
    admin_user_id,
    action_type,
    target_user_id,
    action_details,
    security_level
  ) VALUES (
    admin_user_id,
    'admin_profile_secured',
    admin_user_id,
    jsonb_build_object('email', admin_email, 'method', 'secure_function', 'security_update', true),
    'critical'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin profile secured successfully');
END;
$function$;

-- Add security audit log for this security update
INSERT INTO public.admin_security_logs (
  admin_user_id,
  action_type,
  action_details,
  security_level
) VALUES (
  NULL,
  'security_hardening',
  jsonb_build_object(
    'action', 'rls_enabled_service_catalog',
    'admin_consolidation', true,
    'timestamp', now()
  ),
  'critical'
);