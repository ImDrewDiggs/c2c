
CREATE TABLE public.abandoned_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  trash_day TEXT,
  cans INT,
  recycle BOOLEAN DEFAULT false,
  referral_code TEXT,
  step INT DEFAULT 0,
  tier TEXT,
  price_cents INT,
  user_agent TEXT,
  reminder_sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.abandoned_quotes TO service_role;

ALTER TABLE public.abandoned_quotes ENABLE ROW LEVEL SECURITY;

-- Admins may review abandoned quotes for outreach
CREATE POLICY "Admins can view abandoned quotes"
  ON public.abandoned_quotes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- No client writes; edge functions use service role
CREATE POLICY "No client writes"
  ON public.abandoned_quotes
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE INDEX idx_abandoned_quotes_email ON public.abandoned_quotes(email) WHERE email IS NOT NULL;
CREATE INDEX idx_abandoned_quotes_pending ON public.abandoned_quotes(created_at)
  WHERE converted_at IS NULL AND reminder_sent_at IS NULL AND email IS NOT NULL;

CREATE TRIGGER trg_abandoned_quotes_updated_at
  BEFORE UPDATE ON public.abandoned_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
