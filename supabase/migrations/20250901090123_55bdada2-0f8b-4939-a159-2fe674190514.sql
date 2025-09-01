-- Fix Security Definer View issue by converting view to materialized view with RLS
-- This resolves the security issue while maintaining functionality

-- Drop the existing view
DROP VIEW IF EXISTS public.public_service_catalog;

-- Create a materialized view instead (which supports RLS)
CREATE MATERIALIZED VIEW public.public_service_catalog AS
SELECT 
  id,
  name,
  description,
  category,
  frequency,
  CASE
    WHEN category = 'single_family' THEN 
      jsonb_build_object(
        'starting_price', LEAST(price::numeric, 50::numeric),
        'price_range', 'Starting from $' || LEAST(price::numeric, 50::numeric)::text
      )
    WHEN category = 'multi_family' THEN 
      jsonb_build_object(
        'starting_price', LEAST(price::numeric, 15::numeric),
        'price_range', 'Per unit starting from $' || LEAST(price::numeric, 15::numeric)::text
      )
    ELSE 
      jsonb_build_object(
        'contact_for_pricing', true,
        'price_range', 'Contact for pricing'
      )
  END AS public_pricing_info,
  features,
  is_active,
  sort_order
FROM services
WHERE is_active = true;

-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.public_service_catalog ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to service catalog" 
ON public.public_service_catalog 
FOR SELECT 
USING (true);

-- Create a function to refresh the materialized view when services are updated
CREATE OR REPLACE FUNCTION public.refresh_public_service_catalog()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.public_service_catalog;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically refresh the materialized view
CREATE TRIGGER refresh_public_service_catalog_on_insert
  AFTER INSERT ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_public_service_catalog();

CREATE TRIGGER refresh_public_service_catalog_on_update
  AFTER UPDATE ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_public_service_catalog();

CREATE TRIGGER refresh_public_service_catalog_on_delete
  AFTER DELETE ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_public_service_catalog();

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
    'fix_applied', 'converted_to_materialized_view_with_rls',
    'timestamp', now()
  ),
  'high'
);