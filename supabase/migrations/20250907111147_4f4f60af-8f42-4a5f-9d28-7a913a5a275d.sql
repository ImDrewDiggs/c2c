-- Create comprehensive role-based access control system
CREATE TYPE public.user_role AS ENUM ('customer', 'employee', 'admin', 'super_admin');
CREATE TYPE public.permission AS ENUM (
  'read_users', 'write_users', 'delete_users',
  'read_orders', 'write_orders', 'delete_orders',
  'read_analytics', 'manage_subscriptions', 'manage_vehicles',
  'manage_schedules', 'manage_fleet', 'manage_properties',
  'manage_settings', 'view_audit_logs', 'manage_roles'
);

-- User roles table with hierarchical structure
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Role permissions mapping
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

-- Rate limiting table for persistent rate limiting
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- Could be IP, user_id, etc.
  action_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Configuration management table
CREATE TABLE public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced security audit logs
CREATE TABLE public.enhanced_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_security_logs ENABLE ROW LEVEL SECURITY;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  -- Customer permissions
  ('customer', 'read_orders'),
  -- Employee permissions
  ('employee', 'read_orders'),
  ('employee', 'write_orders'),
  ('employee', 'read_users'),
  -- Admin permissions (all employee permissions plus more)
  ('admin', 'read_orders'),
  ('admin', 'write_orders'),
  ('admin', 'delete_orders'),
  ('admin', 'read_users'),
  ('admin', 'write_users'),
  ('admin', 'read_analytics'),
  ('admin', 'manage_subscriptions'),
  ('admin', 'manage_vehicles'),
  ('admin', 'manage_schedules'),
  ('admin', 'manage_fleet'),
  ('admin', 'manage_properties'),
  ('admin', 'view_audit_logs'),
  -- Super admin permissions (all permissions)
  ('super_admin', 'read_orders'),
  ('super_admin', 'write_orders'),
  ('super_admin', 'delete_orders'),
  ('super_admin', 'read_users'),
  ('super_admin', 'write_users'),
  ('super_admin', 'delete_users'),
  ('super_admin', 'read_analytics'),
  ('super_admin', 'manage_subscriptions'),
  ('super_admin', 'manage_vehicles'),
  ('super_admin', 'manage_schedules'),
  ('super_admin', 'manage_fleet'),
  ('super_admin', 'manage_properties'),
  ('super_admin', 'manage_settings'),
  ('super_admin', 'view_audit_logs'),
  ('super_admin', 'manage_roles');

-- Insert default configuration
INSERT INTO public.app_config (key, value, category, description) VALUES
  ('max_login_attempts', '5', 'security', 'Maximum login attempts before account lockout'),
  ('lockout_duration_minutes', '15', 'security', 'Account lockout duration in minutes'),
  ('session_timeout_hours', '24', 'security', 'Session timeout in hours'),
  ('password_min_length', '12', 'security', 'Minimum password length'),
  ('admin_creation_enabled', 'false', 'security', 'Whether admin creation is enabled'),
  ('cors_allowed_origins', '["*"]', 'security', 'Allowed CORS origins', true);

-- Create secure functions for role management
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(role user_role, is_active BOOLEAN, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role, ur.is_active, ur.expires_at
  FROM public.user_roles ur
  WHERE ur.user_id = check_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.has_permission(check_permission permission, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = check_user_id
      AND rp.permission = check_permission
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id
      AND ur.role IN ('admin', 'super_admin')
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_user(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id
      AND ur.role = 'super_admin'
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  limit_identifier TEXT,
  action_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window_start TIMESTAMP WITH TIME ZONE;
  current_window_end TIMESTAMP WITH TIME ZONE;
  current_attempts INTEGER;
BEGIN
  current_window_start := date_trunc('minute', now()) - (extract(minute from now())::integer % window_minutes) * interval '1 minute';
  current_window_end := current_window_start + (window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO public.rate_limits (identifier, action_type, window_start, window_end)
  VALUES (limit_identifier, action_type, current_window_start, current_window_end)
  ON CONFLICT (identifier, action_type) 
  DO UPDATE SET
    attempt_count = CASE 
      WHEN rate_limits.window_end <= now() THEN 1
      ELSE rate_limits.attempt_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_end <= now() THEN current_window_start
      ELSE rate_limits.window_start
    END,
    window_end = CASE
      WHEN rate_limits.window_end <= now() THEN current_window_end
      ELSE rate_limits.window_end
    END,
    is_blocked = CASE
      WHEN rate_limits.window_end <= now() THEN false
      ELSE (rate_limits.attempt_count + 1) > max_attempts
    END,
    updated_at = now()
  RETURNING attempt_count INTO current_attempts;
  
  -- Return whether the action should be blocked
  RETURN current_attempts > max_attempts;
END;
$$;

-- Secure admin creation function
CREATE OR REPLACE FUNCTION public.create_admin_user(
  target_email TEXT,
  target_role user_role DEFAULT 'admin',
  requesting_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  config_value JSONB;
  result JSONB;
BEGIN
  -- Check if requesting user is super admin
  IF NOT public.is_super_admin_user(requesting_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Check if admin creation is enabled
  SELECT value INTO config_value FROM public.app_config WHERE key = 'admin_creation_enabled';
  IF config_value::text::boolean = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin creation is currently disabled');
  END IF;
  
  -- Rate limit check
  IF public.check_rate_limit(requesting_user_id::text, 'admin_creation', 3, 60) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded');
  END IF;
  
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Add role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, target_role, requesting_user_id)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    is_active = true,
    assigned_by = requesting_user_id,
    assigned_at = now(),
    updated_at = now();
  
  -- Update profile role for backward compatibility
  UPDATE public.profiles 
  SET role = target_role::text, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO public.enhanced_security_logs (
    user_id, action_type, resource_type, resource_id, 
    new_values, risk_level, metadata
  ) VALUES (
    requesting_user_id, 'admin_role_assigned', 'user', target_user_id,
    jsonb_build_object('role', target_role, 'target_email', target_email),
    'critical',
    jsonb_build_object('assigned_by', requesting_user_id)
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Admin role assigned successfully');
END;
$$;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin_user());

CREATE POLICY "Anyone can read role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.is_super_admin_user());

CREATE POLICY "Admins can view rate limits" ON public.rate_limits
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

CREATE POLICY "Admins can read non-sensitive config" ON public.app_config
  FOR SELECT USING (public.is_admin_user() AND NOT is_sensitive);

CREATE POLICY "Super admins can manage all config" ON public.app_config
  FOR ALL USING (public.is_super_admin_user());

CREATE POLICY "Admins can view security logs" ON public.enhanced_security_logs
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "System can insert security logs" ON public.enhanced_security_logs
  FOR INSERT WITH CHECK (true);

-- Create initial super admin (to be removed after proper setup)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the hardcoded admin email user
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'diggs844037@yahoo.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Add super admin role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (admin_user_id, 'super_admin', admin_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile
    UPDATE public.profiles 
    SET role = 'super_admin'
    WHERE id = admin_user_id;
  END IF;
END $$;

-- Add triggers for audit logging
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.enhanced_security_logs (
      user_id, action_type, resource_type, resource_id,
      new_values, risk_level
    ) VALUES (
      NEW.assigned_by, 'role_assigned', 'user', NEW.user_id,
      jsonb_build_object('role', NEW.role), 'high'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.enhanced_security_logs (
      user_id, action_type, resource_type, resource_id,
      old_values, new_values, risk_level
    ) VALUES (
      auth.uid(), 'role_updated', 'user', NEW.user_id,
      jsonb_build_object('role', OLD.role, 'is_active', OLD.is_active),
      jsonb_build_object('role', NEW.role, 'is_active', NEW.is_active),
      'high'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.enhanced_security_logs (
      user_id, action_type, resource_type, resource_id,
      old_values, risk_level
    ) VALUES (
      auth.uid(), 'role_revoked', 'user', OLD.user_id,
      jsonb_build_object('role', OLD.role), 'high'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_user_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_user_role_changes();

-- Add updated_at triggers
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();