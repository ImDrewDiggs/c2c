-- Phase 1: Critical Privilege Escalation Fix (Fixed)
-- Remove role column from profiles table to prevent privilege escalation

-- Step 1: Drop the role column with CASCADE to remove all dependencies
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 2: Update has_role function to ONLY check user_roles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::user_role
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 3: Update is_admin_by_email to use RBAC only (remove email hardcoding)
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 4: Update OTP expiry to 10 minutes (Phase 4)
CREATE OR REPLACE FUNCTION public.validate_otp_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.expires_at := NEW.created_at + INTERVAL '10 minutes';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_otp_expiry ON public.otps;
CREATE TRIGGER set_otp_expiry
  BEFORE INSERT ON public.otps
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_otp_expiry();

-- Step 5: Add PII access logging (Phase 3)
CREATE TABLE IF NOT EXISTS public.pii_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  accessed_user_id uuid NOT NULL,
  accessed_fields text[] NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pii_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view PII access logs"
ON public.pii_access_logs
FOR SELECT
USING (is_super_admin_user());

CREATE POLICY "System can insert PII access logs"
ON public.pii_access_logs
FOR INSERT
WITH CHECK (true);

-- Step 6: Add security comment to prevent future role column addition
COMMENT ON TABLE public.profiles IS 'SECURITY: Roles MUST only be stored in user_roles table. Never add a role column to this table as it creates privilege escalation vulnerabilities.';