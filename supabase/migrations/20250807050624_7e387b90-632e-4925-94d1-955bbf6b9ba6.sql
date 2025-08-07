-- Phase 1: Remove hardcoded credentials dependency and enhance RLS policies

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has specific role without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Update houses table policies to be more restrictive
DROP POLICY IF EXISTS "Employees can view houses" ON public.houses;
CREATE POLICY "Employees can view assigned houses" 
ON public.houses 
FOR SELECT 
USING (
  is_admin_by_email() OR 
  EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE assignments.house_id = houses.id 
    AND assignments.employee_id = auth.uid()
  )
);

-- Update maintenance_schedules policies to be more restrictive  
DROP POLICY IF EXISTS "Employees can view maintenance schedules" ON public.maintenance_schedules;
CREATE POLICY "Employees can view relevant maintenance schedules" 
ON public.maintenance_schedules 
FOR SELECT 
USING (
  is_admin_by_email() OR 
  EXISTS (
    SELECT 1 FROM public.vehicle_assignments 
    WHERE vehicle_assignments.vehicle_id = maintenance_schedules.vehicle_id 
    AND vehicle_assignments.employee_id = auth.uid()
    AND (vehicle_assignments.unassigned_date IS NULL OR vehicle_assignments.unassigned_date >= CURRENT_DATE)
  )
);

-- Update vehicles table policies to be more restrictive
DROP POLICY IF EXISTS "Employees can view vehicles" ON public.vehicles;
CREATE POLICY "Employees can view assigned vehicles" 
ON public.vehicles 
FOR SELECT 
USING (
  is_admin_by_email() OR 
  EXISTS (
    SELECT 1 FROM public.vehicle_assignments 
    WHERE vehicle_assignments.vehicle_id = vehicles.id 
    AND vehicle_assignments.employee_id = auth.uid()
    AND (vehicle_assignments.unassigned_date IS NULL OR vehicle_assignments.unassigned_date >= CURRENT_DATE)
  )
);

-- Add audit logging for security events
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (is_admin_by_email());

-- Create function for secure admin creation without hardcoded credentials
CREATE OR REPLACE FUNCTION public.create_secure_admin_profile(
  admin_user_id uuid,
  admin_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Validate that email is in approved admin list
  IF admin_email NOT IN ('diggs844037@yahoo.com', 'drewdiggs844037@gmail.com') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized admin email');
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
    
  -- Log the admin creation
  INSERT INTO public.security_audit_logs (user_id, event_type, event_details)
  VALUES (admin_user_id, 'admin_profile_created', jsonb_build_object('email', admin_email));
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin profile created successfully');
END;
$$;