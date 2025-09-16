-- Fix remaining functions without search_path set

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(role user_role, is_active boolean, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT ur.role, ur.is_active, ur.expires_at
  FROM public.user_roles ur
  WHERE ur.user_id = check_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(check_permission permission, check_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = check_user_id
      AND rp.permission = check_permission
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id
      AND ur.role IN ('admin', 'super_admin')
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin_user(check_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = check_user_id
      AND ur.role = 'super_admin'
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$function$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.sync_public_service_catalog()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Clear existing data
  DELETE FROM public.public_service_catalog;
  
  -- Insert current active services with public pricing
  INSERT INTO public.public_service_catalog (
    id, name, description, category, frequency, 
    public_pricing_info, features, is_active, sort_order, updated_at
  )
  SELECT 
    id,
    name,
    description,
    category,
    frequency,
    CASE
      WHEN category = 'single_family' THEN 
        jsonb_build_object(
          'starting_price', LEAST(price::numeric, 50::numeric),
          'price_range', 'Starting from $' || LEAST(price::numeric, 50::numeric)::text
        )
      WHEN category = 'multi_family' THEN 
        jsonb_build_object(
          'starting_price', LEAST(price::numeric, 15::numeric),
          'price_range', 'Per unit starting from $' || LEAST(price::numeric, 15::numeric)::text
        )
      ELSE 
        jsonb_build_object(
          'contact_for_pricing', true,
          'price_range', 'Contact for pricing'
        )
    END AS public_pricing_info,
    features,
    is_active,
    sort_order,
    now()
  FROM services
  WHERE is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_public_service_catalog()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  PERFORM public.sync_public_service_catalog();
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_work_session_hours()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Calculate total hours when clock_out_time is set
  IF NEW.clock_out_time IS NOT NULL AND OLD.clock_out_time IS NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0;
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$function$;