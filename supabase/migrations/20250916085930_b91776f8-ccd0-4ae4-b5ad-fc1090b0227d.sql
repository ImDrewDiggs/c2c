-- CRITICAL SECURITY FIXES

-- 1. Fix Role Permissions Exposure - Restrict access to authenticated users only
DROP POLICY IF EXISTS "Anyone can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can read role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Add search_path security to all database functions
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid())) = 'diggs844037@yahoo.com';
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin_by_email() THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_secure_admin_profile(admin_user_id uuid, admin_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT CASE
    WHEN lower(_role) = 'admin' THEN
      (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = _user_id AND lower(role) = 'admin'
        )
      ) AND public.is_admin_by_email()
    ELSE
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = _user_id AND lower(role) = lower(_role)
      )
  END
$function$;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Prevent non-admins from setting admin role
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    IF NOT public.is_admin_by_email() THEN
      RAISE EXCEPTION 'Unauthorized attempt to escalate to admin role';
    END IF;
  END IF;
  
  -- Log role changes for audit
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.admin_security_logs (
      admin_user_id,
      action_type,
      target_user_id,
      action_details,
      security_level
    ) VALUES (
      auth.uid(),
      'role_change_attempt',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_email', NEW.email,
        'timestamp', now()
      ),
      'critical'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Create database-backed rate limiting functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _action_type text,
  _max_attempts integer DEFAULT 10,
  _window_minutes integer DEFAULT 15
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
  is_blocked boolean := false;
BEGIN
  window_start_time := now() - (_window_minutes || ' minutes')::interval;
  
  -- Count attempts in current window
  SELECT COUNT(*) INTO current_count
  FROM public.rate_limits
  WHERE identifier = _identifier
    AND action_type = _action_type
    AND window_start > window_start_time;
  
  -- Check if blocked
  SELECT COALESCE(bool_or(is_blocked), false) INTO is_blocked
  FROM public.rate_limits
  WHERE identifier = _identifier
    AND action_type = _action_type
    AND window_end > now();
  
  -- If at limit, block for window period
  IF current_count >= _max_attempts THEN
    INSERT INTO public.rate_limits (
      identifier,
      action_type,
      attempt_count,
      window_start,
      window_end,
      is_blocked
    ) VALUES (
      _identifier,
      _action_type,
      current_count + 1,
      now(),
      now() + (_window_minutes || ' minutes')::interval,
      true
    )
    ON CONFLICT (identifier, action_type) 
    DO UPDATE SET
      attempt_count = EXCLUDED.attempt_count,
      window_end = EXCLUDED.window_end,
      is_blocked = true,
      updated_at = now();
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'attempts_remaining', 0,
      'reset_time', now() + (_window_minutes || ' minutes')::interval
    );
  END IF;
  
  -- Record attempt
  INSERT INTO public.rate_limits (
    identifier,
    action_type,
    attempt_count,
    window_start,
    window_end
  ) VALUES (
    _identifier,
    _action_type,
    current_count + 1,
    now(),
    now() + (_window_minutes || ' minutes')::interval
  )
  ON CONFLICT (identifier, action_type)
  DO UPDATE SET
    attempt_count = EXCLUDED.attempt_count,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'allowed', true,
    'blocked', false,
    'attempts_remaining', _max_attempts - (current_count + 1),
    'reset_time', now() + (_window_minutes || ' minutes')::interval
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  _identifier text,
  _action_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.rate_limits
  WHERE identifier = _identifier
    AND action_type = _action_type;
END;
$function$;

-- 4. Add unique constraint to rate_limits to prevent duplicates
ALTER TABLE public.rate_limits 
ADD CONSTRAINT rate_limits_identifier_action_unique 
UNIQUE (identifier, action_type);

-- 5. Enhanced security logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for sensitive tables
DROP TRIGGER IF EXISTS log_user_roles_changes ON public.user_roles;
CREATE TRIGGER log_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

DROP TRIGGER IF EXISTS log_role_permissions_changes ON public.role_permissions;
CREATE TRIGGER log_role_permissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

-- 6. Add index for better performance on security logs
CREATE INDEX IF NOT EXISTS idx_enhanced_security_logs_user_action 
ON public.enhanced_security_logs (user_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits (identifier, action_type, window_start DESC);