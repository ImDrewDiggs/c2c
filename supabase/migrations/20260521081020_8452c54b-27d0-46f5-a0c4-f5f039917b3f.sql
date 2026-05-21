
-- 1. Drop overly permissive INSERT policies; service_role bypasses RLS so edge functions still work
DROP POLICY IF EXISTS "System can insert alerts" ON public.iot_sensor_alerts;
DROP POLICY IF EXISTS "System can insert readings" ON public.iot_sensor_readings;
DROP POLICY IF EXISTS "System can insert PII access logs" ON public.pii_access_logs;

-- 2. Defense-in-depth: explicit deny INSERT on otps via API
CREATE POLICY "Deny client OTP inserts"
  ON public.otps
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 3. Prevent super_admin role escalation by anyone other than the service_role
CREATE OR REPLACE FUNCTION public.prevent_super_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'super_admin'::user_role AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Super admin role can only be assigned via service_role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_super_admin_escalation_trg ON public.user_roles;
CREATE TRIGGER prevent_super_admin_escalation_trg
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_super_admin_escalation();

-- 4. Revoke client visibility of Stripe identifiers (server-side service_role still has access)
REVOKE SELECT (stripe_session_id, stripe_payment_intent_id) ON public.orders FROM authenticated, anon;
REVOKE SELECT (stripe_customer_id) ON public.subscribers FROM authenticated, anon;
