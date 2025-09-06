-- Fix remaining database function search path issues

-- Update update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update calculate_work_session_hours function with proper search path
CREATE OR REPLACE FUNCTION public.calculate_work_session_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Calculate total hours when clock_out_time is set
  IF NEW.clock_out_time IS NOT NULL AND OLD.clock_out_time IS NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0;
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;