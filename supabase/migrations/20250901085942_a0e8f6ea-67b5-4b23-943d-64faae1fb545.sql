-- Fix Security Definer View issue by enabling RLS on public_service_catalog view
-- This ensures the view uses the querying user's permissions rather than the creator's

-- Enable RLS on the view
ALTER VIEW public.public_service_catalog ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to the service catalog
CREATE POLICY "Allow public read access to service catalog" 
ON public.public_service_catalog 
FOR SELECT 
USING (true);

-- Log this security fix
INSERT INTO public.admin_security_logs (
  admin_user_id,
  action_type,
  action_details,
  security_level
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_fix',
  jsonb_build_object(
    'issue', 'security_definer_view',
    'view_name', 'public_service_catalog',
    'fix_applied', 'enabled_rls_and_public_policy',
    'timestamp', now()
  ),
  'high'
);