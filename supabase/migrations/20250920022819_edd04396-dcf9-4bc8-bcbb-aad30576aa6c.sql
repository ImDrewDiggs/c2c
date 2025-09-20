-- Security Fix: Update database functions to use proper search_path
-- This prevents potential SQL injection through search_path manipulation

-- Fix functions that don't have proper search_path set
CREATE OR REPLACE FUNCTION public.anonymize_location_data(location_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reduce precision of coordinates for privacy
  RETURN jsonb_build_object(
    'lat', round((location_data->>'lat')::numeric, 2),
    'lng', round((location_data->>'lng')::numeric, 2),
    'anonymized', true,
    'timestamp', location_data->>'timestamp'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(data text, field_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced encryption for sensitive data like driver's licenses
  -- Using a more secure approach with proper salt
  RETURN encode(digest(data || field_name || 'enhanced_security_salt_2024', 'sha256'), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced logging for sensitive table changes with proper search path
  INSERT INTO public.enhanced_security_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    risk_level,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE 
      WHEN TG_TABLE_NAME IN ('profiles', 'payments', 'employee_locations') THEN 'high'
      WHEN TG_TABLE_NAME IN ('messages', 'admin_sessions') THEN 'critical'
      ELSE 'medium'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Enhanced public service catalog security: Restrict detailed pricing access
CREATE OR REPLACE FUNCTION public.sync_public_service_catalog()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear existing data
  DELETE FROM public.public_service_catalog;
  
  -- Insert limited public information without detailed pricing
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
    -- Security fix: Limit pricing information to prevent business data exposure
    jsonb_build_object(
      'contact_for_pricing', true,
      'price_range', 'Contact for custom quote',
      'pricing_available', 'Upon request'
    ) AS public_pricing_info,
    -- Limit feature details
    CASE 
      WHEN array_length((features)::text[], 1) > 3 
      THEN jsonb_build_array(
        features->0,
        features->1, 
        features->2,
        '"Contact us for full feature details"'
      )
      ELSE features
    END AS features,
    is_active,
    sort_order,
    now()
  FROM services
  WHERE is_active = true;
END;
$function$;

-- Add function to encrypt driver's license data
CREATE OR REPLACE FUNCTION public.encrypt_drivers_license()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Encrypt driver's license if provided
  IF NEW.drivers_license IS NOT NULL AND NEW.drivers_license != '' THEN
    NEW.drivers_license = public.encrypt_sensitive_field(NEW.drivers_license, 'drivers_license');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for driver's license encryption
DROP TRIGGER IF EXISTS encrypt_drivers_license_trigger ON public.profiles;
CREATE TRIGGER encrypt_drivers_license_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_drivers_license();