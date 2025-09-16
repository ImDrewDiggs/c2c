-- Clean up admin access and ensure only diggs844037@yahoo.com is admin

-- First, remove admin role from any unauthorized users
UPDATE profiles 
SET role = 'customer', status = 'active', updated_at = now()
WHERE email != 'diggs844037@yahoo.com' AND role = 'admin';

-- Update the correct admin user
UPDATE profiles 
SET role = 'admin', status = 'active', updated_at = now()
WHERE email = 'diggs844037@yahoo.com';

-- Clear all existing user roles to start fresh
UPDATE user_roles SET is_active = false WHERE is_active = true;

-- Get the user ID for the admin email
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the user ID for diggs844037@yahoo.com
    SELECT au.id INTO admin_user_id
    FROM auth.users au
    WHERE au.email = 'diggs844037@yahoo.com';
    
    -- If user exists in auth.users, set up proper roles
    IF admin_user_id IS NOT NULL THEN
        -- Ensure profile exists and is admin
        INSERT INTO profiles (id, email, role, full_name, status)
        VALUES (admin_user_id, 'diggs844037@yahoo.com', 'admin', 'System Administrator', 'active')
        ON CONFLICT (id) 
        DO UPDATE SET 
            email = 'diggs844037@yahoo.com',
            role = 'admin',
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name, 'System Administrator'),
            status = 'active',
            updated_at = now();

        -- Set up super_admin role in user_roles table
        INSERT INTO user_roles (user_id, role, assigned_by, assigned_at, is_active)
        VALUES (admin_user_id, 'super_admin', admin_user_id, now(), true)
        ON CONFLICT (user_id, role) 
        DO UPDATE SET 
            is_active = true,
            assigned_at = now(),
            updated_at = now();

        -- Also add admin role for backward compatibility
        INSERT INTO user_roles (user_id, role, assigned_by, assigned_at, is_active)
        VALUES (admin_user_id, 'admin', admin_user_id, now(), true)
        ON CONFLICT (user_id, role) 
        DO UPDATE SET 
            is_active = true,
            assigned_at = now(),
            updated_at = now();
    END IF;
END $$;

-- Update the admin email check function to only recognize the correct email
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid())) = 'diggs844037@yahoo.com';
END;
$function$;

-- Log this security action
INSERT INTO enhanced_security_logs (
    action_type,
    resource_type,
    risk_level,
    metadata
) VALUES (
    'admin_access_cleanup',
    'user_management',
    'critical',
    jsonb_build_object(
        'admin_email', 'diggs844037@yahoo.com',
        'action', 'restricted_admin_access_to_single_user',
        'timestamp', now()
    )
);