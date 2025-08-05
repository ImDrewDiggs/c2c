-- Create profiles table with proper structure
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'employee', 'admin')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if current user is admin by email
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) IN ('diggs844037@yahoo.com', 'drewdiggs844037@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create another function to safely create admin profiles
CREATE OR REPLACE FUNCTION public.create_admin_profile_safe(
  admin_user_id UUID,
  admin_email TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (admin_user_id, admin_email, 'admin', 'Administrator')
  ON CONFLICT (email) 
  DO UPDATE SET 
    role = 'admin',
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin_by_email());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin_by_email());

CREATE POLICY "Admins can insert any profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin_by_email());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();