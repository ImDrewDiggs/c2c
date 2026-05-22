-- 1) Tighten admin_security_logs INSERT
DROP POLICY IF EXISTS "System can insert security logs" ON public.admin_security_logs;
CREATE POLICY "Admins can insert own security logs"
  ON public.admin_security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user() AND admin_user_id = auth.uid());

-- 2) Hide Stripe/PayPal identifiers on payments from client roles
REVOKE SELECT (stripe_payment_intent_id, paypal_transaction_id) ON public.payments FROM anon, authenticated;

-- 3) Protect sensitive profile fields from self-service modification
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and admins full control
  IF COALESCE(auth.role(), '') = 'service_role' OR is_admin_user() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Customers cannot self-assign these fields
    NEW.pay_rate := NULL;
    NEW.drivers_license := NULL;
    NEW.job_title := 'Employee';
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Preserve existing values for sensitive fields
    NEW.pay_rate := OLD.pay_rate;
    NEW.drivers_license := OLD.drivers_license;
    NEW.job_title := OLD.job_title;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_sensitive_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_sensitive_profile_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_sensitive_profile_fields();
