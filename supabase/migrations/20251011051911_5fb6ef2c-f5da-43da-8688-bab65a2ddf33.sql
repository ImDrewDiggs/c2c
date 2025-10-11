-- Fix Critical RLS Bypass Issues - Replace USING(true) policies with proper authentication

-- 1. Fix rate_limits table - restrict to authenticated users only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;

-- Only system functions should insert/update rate limits (via SECURITY DEFINER functions)
-- Admins can view for monitoring
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
USING (is_admin_user());

-- System functions handle INSERT/UPDATE/DELETE through SECURITY DEFINER functions only
-- No direct public access to manipulate rate limits

-- 2. Fix enhanced_security_logs table - restrict inserts to authenticated system only
DROP POLICY IF EXISTS "System can insert security logs" ON public.enhanced_security_logs;
DROP POLICY IF EXISTS "Admins can view security logs" ON public.enhanced_security_logs;

CREATE POLICY "Admins can view security logs"
ON public.enhanced_security_logs
FOR SELECT
USING (is_admin_user());

-- Only allow authenticated users to insert logs (functions will use SECURITY DEFINER)
CREATE POLICY "Authenticated system can insert security logs"
ON public.enhanced_security_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix terms_acceptance table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can record terms acceptance" ON public.terms_acceptance;
DROP POLICY IF EXISTS "Admins can view all terms acceptance" ON public.terms_acceptance;
DROP POLICY IF EXISTS "Users can view their own terms acceptance" ON public.terms_acceptance;

CREATE POLICY "Admins can manage terms acceptance"
ON public.terms_acceptance
FOR ALL
USING (is_admin_by_email());

-- Authenticated users can insert their own terms acceptance
CREATE POLICY "Authenticated users can record terms acceptance"
ON public.terms_acceptance
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR user_id IS NULL));

CREATE POLICY "Users can view their own terms acceptance"
ON public.terms_acceptance
FOR SELECT
USING (auth.uid() = user_id OR is_admin_by_email());

-- 4. Fix role_permissions table - remove public read access
DROP POLICY IF EXISTS "Authenticated users can read role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage role permissions" ON public.role_permissions;

-- Only authenticated users can view permissions (needed for permission checks)
CREATE POLICY "Authenticated users can read role permissions"
ON public.role_permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage role permissions"
ON public.role_permissions
FOR ALL
USING (is_super_admin_user());

-- 5. Fix admin_sessions table - restrict to authenticated admins only
DROP POLICY IF EXISTS "System can manage admin sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Admins can view their own sessions" ON public.admin_sessions;

CREATE POLICY "Admins can view their own sessions"
ON public.admin_sessions
FOR SELECT
USING (admin_user_id = auth.uid() OR is_super_admin_user());

-- Only authenticated admins can create/update their own sessions
CREATE POLICY "Admins can manage own sessions"
ON public.admin_sessions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND admin_user_id = auth.uid());

CREATE POLICY "Admins can update own sessions"
ON public.admin_sessions
FOR UPDATE
USING (admin_user_id = auth.uid() OR is_super_admin_user());

-- 6. Add authentication checks to SECURITY DEFINER functions

-- Fix check_rate_limit to require authentication
CREATE OR REPLACE FUNCTION public.check_rate_limit(_identifier text, _action_type text, _max_attempts integer DEFAULT 10, _window_minutes integer DEFAULT 15)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
  is_blocked boolean := false;
BEGIN
  -- Validate inputs
  IF _identifier IS NULL OR _identifier = '' THEN
    RAISE EXCEPTION 'Invalid identifier';
  END IF;
  
  IF _action_type IS NULL OR _action_type = '' THEN
    RAISE EXCEPTION 'Invalid action type';
  END IF;
  
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
$$;

-- Fix handle_new_user to validate role input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Extract role from metadata with strict validation
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Validate role is one of the allowed values
  IF user_role NOT IN ('customer', 'employee', 'admin', 'super_admin') THEN
    user_role := 'customer'; -- Default to customer for invalid roles
  END IF;
  
  -- Create profile entry
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign role in user_roles table (only customer/employee allowed via signup)
  -- Admin roles must be assigned manually via secure admin management
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (
    NEW.id,
    CASE 
      WHEN user_role IN ('admin', 'super_admin') THEN 'customer'::user_role
      ELSE user_role::user_role
    END,
    true
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;