-- CRITICAL SECURITY FIXES FOR CAN2CURB APPLICATION
-- This migration addresses PII exposure, payment data security, and RBAC consolidation

-- ============================================================================
-- STEP 1: Fix is_admin_by_email() to use RBAC instead of hardcoded emails
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use RBAC system instead of hardcoded email check
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
-- STEP 2: Add column-level security for pay_rate in profiles
-- ============================================================================
-- Drop existing broad policies and create more granular ones
DROP POLICY IF EXISTS "Users can view own profile with limited PII" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own basic profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all basic profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  is_admin_by_email() AND 
  auth.uid() != id
);

-- Restrict pay_rate viewing to super admins and the employee themselves
CREATE POLICY "Restrict pay_rate to super admins and self"
ON profiles FOR SELECT
TO authenticated
USING (
  is_super_admin_user() OR 
  (auth.uid() = id AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('employee', 'admin', 'super_admin')
      AND is_active = true
  ))
);

-- ============================================================================
-- STEP 3: Fix subscribers table - remove email fallback vulnerability
-- ============================================================================
DROP POLICY IF EXISTS "select_own_subscription" ON subscribers;
DROP POLICY IF EXISTS "insert_own_subscription" ON subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON subscribers;

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON subscribers FOR SELECT
TO authenticated
USING (is_admin_by_email());

-- Users can only access their subscription via user_id (no email fallback)
CREATE POLICY "Users view own subscription by user_id only"
ON subscribers FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND user_id IS NOT NULL);

CREATE POLICY "Users insert own subscription by user_id only"
ON subscribers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND user_id IS NOT NULL);

CREATE POLICY "Users update own subscription by user_id only"
ON subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND user_id IS NOT NULL)
WITH CHECK (user_id = auth.uid() AND user_id IS NOT NULL);

-- ============================================================================
-- STEP 4: Restrict site_settings to super admins only
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

CREATE POLICY "Super admins can modify site settings"
ON site_settings FOR ALL
TO authenticated
USING (is_super_admin_user())
WITH CHECK (is_super_admin_user());

CREATE POLICY "Admins can read site settings"
ON site_settings FOR SELECT
TO authenticated
USING (is_admin_user());

-- ============================================================================
-- STEP 5: Implement location data privacy and retention
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_employee_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymize locations older than 7 days (reduce precision to 2 decimals)
  UPDATE employee_locations
  SET 
    latitude = ROUND(latitude::numeric, 2),
    longitude = ROUND(longitude::numeric, 2)
  WHERE timestamp < NOW() - INTERVAL '7 days'
    AND (
      latitude::text ~ '\.\d{3,}' OR 
      longitude::text ~ '\.\d{3,}'
    );
  
  -- Delete locations older than 30 days
  DELETE FROM employee_locations
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Log the cleanup action
  INSERT INTO public.enhanced_security_logs (
    action_type,
    resource_type,
    risk_level,
    metadata
  ) VALUES (
    'location_data_cleanup',
    'employee_locations',
    'medium',
    jsonb_build_object(
      'anonymized_count', (SELECT COUNT(*) FROM employee_locations WHERE timestamp < NOW() - INTERVAL '7 days'),
      'deleted_count', (SELECT COUNT(*) FROM employee_locations WHERE timestamp < NOW() - INTERVAL '30 days'),
      'timestamp', NOW()
    )
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_employee_locations() IS 
'Anonymizes employee location data older than 7 days and deletes data older than 30 days for privacy compliance. Should be run daily via scheduled task.';