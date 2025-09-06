-- Security hardening: Fix database function search paths and strengthen admin protections

-- 1. Update database functions to use STABLE and proper search path
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid()))
    IN ('diggs844037@yahoo.com', 'drewdiggs844037@gmail.com');
END;
$$;

-- 2. Strengthen has_role function with proper search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- 3. Update get_current_user_role function with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 4. Add trigger to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- 5. Create trigger for role escalation prevention
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 6. Add password strength validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password_text) < 12 THEN
    errors := array_append(errors, 'Password must be at least 12 characters long');
  END IF;
  
  -- Check for uppercase
  IF password_text !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase
  IF password_text !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for numbers
  IF password_text !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password_text !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Check for weak patterns
  IF password_text ~* '(password|admin|qwerty|123456)' THEN
    errors := array_append(errors, 'Password contains weak patterns');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', errors);
  END IF;
  
  RETURN result;
END;
$$;