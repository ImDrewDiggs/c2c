-- Harden admin profile function access
REVOKE EXECUTE ON FUNCTION public.create_admin_profile_safe(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_secure_admin_profile(uuid, text) TO anon, authenticated;

-- Strengthen has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN lower(_role) = 'admin' THEN
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'admin')
      AND public.is_admin_by_email()
    ELSE
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role)
  END
$$;

-- Prevent non-admin role changes
CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin_by_email() THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_non_admin_role_change();

-- Tighten subscribers policies
DROP POLICY IF EXISTS insert_subscription ON public.subscribers;
DROP POLICY IF EXISTS update_own_subscription ON public.subscribers;

CREATE POLICY "insert_own_subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));

CREATE POLICY "update_own_subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR (email = auth.email()));

-- Fix employee_locations self policies
DROP POLICY IF EXISTS "Employees can insert their own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can update their own location" ON public.employee_locations;

CREATE POLICY "Employees can insert their own location"
ON public.employee_locations
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their own location"
ON public.employee_locations
FOR UPDATE
TO authenticated
USING (employee_id = auth.uid());