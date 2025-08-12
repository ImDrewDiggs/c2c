-- 1) Harden admin email check to be case-insensitive
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN lower((SELECT email FROM auth.users WHERE id = auth.uid()))
    IN ('diggs844037@yahoo.com', 'drewdiggs844037@gmail.com');
END;
$function$;

-- 2) Strengthen has_role with lowercasing and SECURITY DEFINER (already set) + explicit search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 3) Prevent non-admin role changes via trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'tr_prevent_non_admin_role_change'
  ) THEN
    DROP TRIGGER tr_prevent_non_admin_role_change ON public.profiles;
  END IF;
END $$;

CREATE TRIGGER tr_prevent_non_admin_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_non_admin_role_change();

-- 4) Revoke public execution on the insecure helper to avoid misuse
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'create_admin_profile_safe'
  ) THEN
    REVOKE ALL ON FUNCTION public.create_admin_profile_safe(uuid, text) FROM PUBLIC;
    -- Optionally grant to postgres role only (exists in Supabase)
    -- Note: role name may vary; this is safe to attempt
    BEGIN
      GRANT EXECUTE ON FUNCTION public.create_admin_profile_safe(uuid, text) TO postgres;
    EXCEPTION WHEN undefined_object THEN
      -- ignore if role does not exist in this environment
      NULL;
    END;
  END IF;
END $$;

-- 5) Ensure updated_at is maintained for profiles (uses existing function)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'tr_profiles_updated_at'
  ) THEN
    CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;