-- Fix Security Definer View issue by replacing view with a proper table
-- This resolves the security issue while maintaining functionality

-- Drop the existing view
DROP VIEW IF EXISTS public.public_service_catalog CASCADE;

-- Drop the materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.public_service_catalog CASCADE;

-- Create a proper table instead
CREATE TABLE public.public_service_catalog (
  id uuid,
  name text,
  description text,
  category text,
  frequency text,
  public_pricing_info jsonb,
  features jsonb,
  is_active boolean,
  sort_order integer,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.public_service_catalog ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to service catalog" 
ON public.public_service_catalog 
FOR SELECT 
USING (true);

-- Create a function to sync data from services table
CREATE OR REPLACE FUNCTION public.sync_public_service_catalog()
RETURNS void AS $$
BEGIN
  -- Clear existing data
  DELETE FROM public.public_service_catalog;
  
  -- Insert current active services with public pricing
  INSERT INTO public.public_service_catalog (
    id, name, description, category, frequency, 
    public_pricing_info, features, is_active, sort_order, updated_at
  )
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
    sort_order,
    now()
  FROM services
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically sync the table when services are updated
CREATE OR REPLACE FUNCTION public.trigger_sync_public_service_catalog()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.sync_public_service_catalog();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_public_service_catalog_on_insert
  AFTER INSERT ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_public_service_catalog();

CREATE TRIGGER sync_public_service_catalog_on_update
  AFTER UPDATE ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_public_service_catalog();

CREATE TRIGGER sync_public_service_catalog_on_delete
  AFTER DELETE ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sync_public_service_catalog();

-- Populate the table initially
SELECT public.sync_public_service_catalog();

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
    'table_name', 'public_service_catalog',
    'fix_applied', 'converted_view_to_table_with_rls_and_sync',
    'timestamp', now()
  ),
  'high'
);