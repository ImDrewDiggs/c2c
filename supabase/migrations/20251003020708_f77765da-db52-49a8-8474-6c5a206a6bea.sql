-- CRITICAL SECURITY FIXES FOR CAN2CURB - Clean Migration
-- Only updates what needs to be changed

-- ============================================================================
-- Fix is_admin_by_email() to use RBAC system exclusively
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use RBAC system instead of hardcoded email
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- ============================================================================
-- Location data privacy function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_employee_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anonymized_count integer;
  deleted_count integer;
BEGIN
  SELECT COUNT(*) INTO anonymized_count
  FROM employee_locations
  WHERE timestamp < NOW() - INTERVAL '7 days'
    AND (latitude::text ~ '\.\d{3,}' OR longitude::text ~ '\.\d{3,}');

  SELECT COUNT(*) INTO deleted_count
  FROM employee_locations
  WHERE timestamp < NOW() - INTERVAL '30 days';

  UPDATE employee_locations
  SET 
    latitude = ROUND(latitude::numeric, 2),
    longitude = ROUND(longitude::numeric, 2)
  WHERE timestamp < NOW() - INTERVAL '7 days'
    AND (latitude::text ~ '\.\d{3,}' OR longitude::text ~ '\.\d{3,}');
  
  DELETE FROM employee_locations
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  INSERT INTO public.enhanced_security_logs (
    action_type, resource_type, risk_level, metadata
  ) VALUES (
    'location_data_cleanup', 'employee_locations', 'medium',
    jsonb_build_object('anonymized_count', anonymized_count, 'deleted_count', deleted_count, 'timestamp', NOW())
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_employee_locations() IS 
'Anonymizes employee location data older than 7 days and deletes data older than 30 days. Should be run daily via pg_cron.';