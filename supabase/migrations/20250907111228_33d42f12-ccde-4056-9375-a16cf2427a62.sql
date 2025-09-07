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
  identifier TEXT NOT NULL,
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
  ('customer', 'read_orders'),
  ('employee', 'read_orders'),
  ('employee', 'write_orders'),
  ('employee', 'read_users'),
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
INSERT INTO public.app_config (key, value, category, description, is_sensitive) VALUES
  ('max_login_attempts', '5', 'security', 'Maximum login attempts before account lockout', false),
  ('lockout_duration_minutes', '15', 'security', 'Account lockout duration in minutes', false),
  ('session_timeout_hours', '24', 'security', 'Session timeout in hours', false),
  ('password_min_length', '12', 'security', 'Minimum password length', false),
  ('admin_creation_enabled', 'false', 'security', 'Whether admin creation is enabled', false),
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