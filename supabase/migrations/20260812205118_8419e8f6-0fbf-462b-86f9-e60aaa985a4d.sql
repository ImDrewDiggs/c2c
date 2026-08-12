-- Tighten employee_locations RLS
-- Remove admin insert/update privileges; admins only need to view locations
DROP POLICY IF EXISTS "Admins can insert locations" ON public.employee_locations;
DROP POLICY IF EXISTS "Admins can update locations" ON public.employee_locations;

-- Ensure employee self-service policies exist and are strict
DROP POLICY IF EXISTS "Employees can insert own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can update own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can view own location" ON public.employee_locations;

-- Grants: employees manage their own row via RLS; service_role retains full access
GRANT SELECT, INSERT, UPDATE ON public.employee_locations TO authenticated;
GRANT ALL ON public.employee_locations TO service_role;

-- Recreate restrictive employee policies
CREATE POLICY "Employees can insert own location"
  ON public.employee_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own location"
  ON public.employee_locations
  FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can view own location"
  ON public.employee_locations
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());