-- Drop all legacy triggers and functions that reference the removed 'role' column (with CASCADE)
DROP FUNCTION IF EXISTS public.prevent_role_escalation() CASCADE;
DROP FUNCTION IF EXISTS public.prevent_non_admin_role_change() CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_role_changes() CASCADE;

-- Create function to handle new user signup and role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Extract role from metadata, default to 'customer'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Create profile entry
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign role in user_roles table
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (
    NEW.id,
    user_role::user_role,
    true
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users to automatically create profiles and assign roles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix existing test user (one-time migration to assign role)
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get the user ID for the test user
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'drewdiggs844037@gmail.com'
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Ensure profile exists and is active
    INSERT INTO public.profiles (id, email, full_name, status)
    VALUES (
      test_user_id,
      'drewdiggs844037@gmail.com',
      'Test Customer',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET status = 'active';
    
    -- Assign customer role
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (
      test_user_id,
      'customer'::user_role,
      true
    )
    ON CONFLICT (user_id, role) DO UPDATE
    SET is_active = true;
  END IF;
END $$;