CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  service_address text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointments_status_check CHECK (status IN ('scheduled','confirmed','completed','cancelled')),
  CONSTRAINT appointments_title_length CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  CONSTRAINT appointments_time_order CHECK (end_time > start_time)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

CREATE POLICY "Users create own appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

CREATE POLICY "Admins delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE INDEX appointments_user_start_idx ON public.appointments (user_id, start_time DESC);

CREATE OR REPLACE FUNCTION public.validate_appointment_times()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Appointment end time must be after the start time';
  END IF;

  IF TG_OP = 'INSERT' AND NEW.start_time < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'Appointments cannot be scheduled in the past';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_appointments_times
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_times();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();