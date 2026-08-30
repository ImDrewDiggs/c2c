ALTER TABLE public.abandoned_quotes
  ADD COLUMN IF NOT EXISTS plan_id text;