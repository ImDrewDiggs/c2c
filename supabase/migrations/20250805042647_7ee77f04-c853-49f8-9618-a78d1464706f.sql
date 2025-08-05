-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) IN ('diggs844037@yahoo.com', 'drewdiggs844037@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;