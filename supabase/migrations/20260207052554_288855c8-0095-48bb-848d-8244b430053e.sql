
-- Table to store auto-generated monthly service integrity reports per location
CREATE TABLE public.service_integrity_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  report_month DATE NOT NULL, -- first day of the month (e.g. 2026-02-01)
  
  -- Pickup completion metrics
  total_scheduled_pickups INT NOT NULL DEFAULT 0,
  completed_pickups INT NOT NULL DEFAULT 0,
  late_pickups INT NOT NULL DEFAULT 0,
  missed_pickups INT NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Employee performance
  employees_assigned JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- e.g. [{"employee_id":"...","name":"...","pickups_completed":5,"avg_time_minutes":12}]
  
  -- Issues / exceptions
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- e.g. [{"date":"...","type":"missed","description":"..."}]
  
  -- Summary
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 100, -- 0-100
  notes TEXT,
  
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (house_id, report_month)
);

-- Enable RLS
ALTER TABLE public.service_integrity_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view reports
CREATE POLICY "Admins can view service integrity reports"
  ON public.service_integrity_reports FOR SELECT
  USING (public.is_admin_user());

-- Only admins can insert/update (via edge function with service role)
CREATE POLICY "Admins can insert service integrity reports"
  ON public.service_integrity_reports FOR INSERT
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update service integrity reports"
  ON public.service_integrity_reports FOR UPDATE
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete service integrity reports"
  ON public.service_integrity_reports FOR DELETE
  USING (public.is_admin_user());

-- Index for fast lookups
CREATE INDEX idx_sir_house_month ON public.service_integrity_reports (house_id, report_month DESC);
CREATE INDEX idx_sir_month ON public.service_integrity_reports (report_month DESC);

-- Updated_at trigger
CREATE TRIGGER update_service_integrity_reports_updated_at
  BEFORE UPDATE ON public.service_integrity_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
