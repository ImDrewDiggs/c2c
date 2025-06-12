
-- Drop ALL existing policies on the profiles table to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create 4 clean, non-recursive policies

-- 1. SELECT policy: Users can view their own profile OR admins can view all
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- 2. UPDATE policy: Users can update their own profile OR admins can update all
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- 3. INSERT policy: Users can insert only their own profile OR admins can insert any
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- 4. DELETE policy: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE
  USING (
    public.is_admin_by_email()
  );
