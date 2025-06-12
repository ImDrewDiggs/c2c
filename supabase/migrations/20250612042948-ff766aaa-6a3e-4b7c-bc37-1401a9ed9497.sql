
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- View policy: Users can view their own profile; Admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- Update policy: Users can update their own profile; Admins can update all
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- Insert policy: Users can insert only their own profile; Admins can insert any
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    public.is_admin_by_email()
  );

-- Delete policy: Only admins can delete
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE
  USING (
    public.is_admin_by_email()
  );
