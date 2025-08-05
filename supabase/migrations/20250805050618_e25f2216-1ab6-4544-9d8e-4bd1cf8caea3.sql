-- Create employee_locations table
CREATE TABLE public.employee_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create houses table
CREATE TABLE public.houses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_locations
CREATE POLICY "Admins can view all employee locations" 
ON public.employee_locations 
FOR SELECT 
USING (is_admin_by_email());

CREATE POLICY "Admins can insert employee locations" 
ON public.employee_locations 
FOR INSERT 
WITH CHECK (is_admin_by_email());

CREATE POLICY "Admins can update employee locations" 
ON public.employee_locations 
FOR UPDATE 
USING (is_admin_by_email());

CREATE POLICY "Employees can view their own location" 
ON public.employee_locations 
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Employees can update their own location" 
ON public.employee_locations 
FOR INSERT 
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can insert their own location" 
ON public.employee_locations 
FOR UPDATE 
USING (employee_id = auth.uid());

-- RLS Policies for houses
CREATE POLICY "Admins can manage all houses" 
ON public.houses 
FOR ALL 
USING (is_admin_by_email());

CREATE POLICY "Employees can view houses" 
ON public.houses 
FOR SELECT 
USING (true);

-- RLS Policies for assignments
CREATE POLICY "Admins can manage all assignments" 
ON public.assignments 
FOR ALL 
USING (is_admin_by_email());

CREATE POLICY "Employees can view their assignments" 
ON public.assignments 
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Employees can update their assignments" 
ON public.assignments 
FOR UPDATE 
USING (employee_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin_by_email());

CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (is_admin_by_email());

-- Create indexes for performance
CREATE INDEX idx_employee_locations_employee_id ON public.employee_locations(employee_id);
CREATE INDEX idx_employee_locations_timestamp ON public.employee_locations(timestamp);
CREATE INDEX idx_assignments_employee_id ON public.assignments(employee_id);
CREATE INDEX idx_assignments_house_id ON public.assignments(house_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_employee_locations_updated_at
  BEFORE UPDATE ON public.employee_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houses_updated_at
  BEFORE UPDATE ON public.houses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();