-- Create work_sessions table for time tracking
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out_time TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'active',
  clock_in_location_lat NUMERIC,
  clock_in_location_lng NUMERIC,
  clock_out_location_lat NUMERIC,
  clock_out_location_lng NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_sessions
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for work_sessions
CREATE POLICY "Admins can manage all work sessions"
ON public.work_sessions
FOR ALL
USING (is_admin_by_email());

CREATE POLICY "Employees can view their own work sessions"
ON public.work_sessions
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Employees can create their own work sessions"
ON public.work_sessions
FOR INSERT
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their own work sessions"
ON public.work_sessions
FOR UPDATE
USING (employee_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_work_sessions_updated_at
BEFORE UPDATE ON public.work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate total hours when clocking out
CREATE OR REPLACE FUNCTION public.calculate_work_session_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total hours when clock_out_time is set
  IF NEW.clock_out_time IS NOT NULL AND OLD.clock_out_time IS NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0;
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate hours
CREATE TRIGGER calculate_work_session_hours_trigger
BEFORE UPDATE ON public.work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.calculate_work_session_hours();

-- Enable realtime for work_sessions
ALTER TABLE public.work_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_sessions;

-- Enable realtime for employee_locations (for GPS tracking)
ALTER TABLE public.employee_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_locations;