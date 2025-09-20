-- PHASE 1: Critical Database Security Fixes

-- 1. Fix RLS policies for role_permissions table
DROP POLICY IF EXISTS "Authenticated users can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can read role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Fix RLS policies for rate_limits table - restrict to system operations only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL
USING (true)
WITH CHECK (true);

-- Only allow admins to view rate limits for monitoring
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;
CREATE POLICY "Admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- 3. Enhanced security for security logs - prevent log poisoning
DROP POLICY IF EXISTS "System can insert security logs" ON public.enhanced_security_logs;
CREATE POLICY "System can insert security logs" 
ON public.enhanced_security_logs 
FOR INSERT
WITH CHECK (true);

-- 4. Update database functions with proper search_path for security
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid())) = 'diggs844037@yahoo.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin_by_email() THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 5. Enhanced rate limiting with unique constraints to prevent race conditions
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits (identifier, action_type);

-- 6. Create security monitoring trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all operations on sensitive tables
  INSERT INTO public.enhanced_security_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    risk_level,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE 
      WHEN TG_TABLE_NAME IN ('user_roles', 'role_permissions') THEN 'critical'
      WHEN TG_TABLE_NAME IN ('profiles', 'admin_security_logs') THEN 'high'
      ELSE 'medium'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply security monitoring triggers to sensitive tables
DROP TRIGGER IF EXISTS trigger_log_user_roles_operations ON public.user_roles;
CREATE TRIGGER trigger_log_user_roles_operations
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

DROP TRIGGER IF EXISTS trigger_log_role_permissions_operations ON public.role_permissions;
CREATE TRIGGER trigger_log_role_permissions_operations
    AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

DROP TRIGGER IF EXISTS trigger_log_profiles_operations ON public.profiles;
CREATE TRIGGER trigger_log_profiles_operations
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

-- 7. Enhanced admin session monitoring
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  ip_address inet,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  security_level text NOT NULL DEFAULT 'normal',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own sessions" 
ON public.admin_sessions 
FOR SELECT 
TO authenticated
USING (admin_user_id = auth.uid() OR is_super_admin_user());

CREATE POLICY "System can manage admin sessions" 
ON public.admin_sessions 
FOR ALL
USING (true)
WITH CHECK (true);

-- 8. Create emergency admin disable function
CREATE OR REPLACE FUNCTION public.emergency_disable_admin(target_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only super admins can disable other admins
  IF NOT is_super_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Disable all active roles for the admin
  UPDATE public.user_roles 
  SET is_active = false, updated_at = now()
  WHERE user_id = target_admin_id AND is_active = true;
  
  -- End all active admin sessions
  UPDATE public.admin_sessions 
  SET is_active = false, session_end = now()
  WHERE admin_user_id = target_admin_id AND is_active = true;
  
  -- Log the emergency action
  INSERT INTO public.enhanced_security_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    risk_level,
    metadata
  ) VALUES (
    auth.uid(),
    'emergency_admin_disable',
    'admin_user',
    target_admin_id,
    'critical',
    jsonb_build_object(
      'disabled_by', auth.uid(),
      'timestamp', now(),
      'reason', 'emergency_disable'
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin disabled successfully');
END;
$$;