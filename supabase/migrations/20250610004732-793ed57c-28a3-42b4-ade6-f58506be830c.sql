
-- First, let's create a security definer function to get user role without RLS issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- This function runs with elevated privileges, bypassing RLS
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create another function to check if user is admin by email
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user's email is in admin list
  RETURN (
    SELECT auth.email() IN (
      'diggs844037@yahoo.com',
      'drewdiggs844037@gmail.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies on profiles table that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new, safer RLS policies using the security definer functions
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin_by_email()
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin_by_email()
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_admin_by_email()
  );

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    public.is_admin_by_email()
  );

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
