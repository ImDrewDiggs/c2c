CREATE TABLE public.diagnostics_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('module','auth','network','runtime')),
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('info','warning','error','critical')),
  title text,
  message text NOT NULL,
  source text,
  guidance text,
  url text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostics_logs TO authenticated;
GRANT ALL ON public.diagnostics_logs TO service_role;

ALTER TABLE public.diagnostics_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/super admins can read diagnostics
CREATE POLICY "Admins can view diagnostics logs"
  ON public.diagnostics_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

-- Any authenticated user can insert a diagnostic for themselves (or anon-equivalent with their user_id),
-- but they can NEVER read what they wrote. Service role inserts unrestricted.
CREATE POLICY "Authenticated users can insert their own diagnostics"
  ON public.diagnostics_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Only super admins can delete (for log retention/cleanup)
CREATE POLICY "Super admins can delete diagnostics logs"
  ON public.diagnostics_logs
  FOR DELETE
  TO authenticated
  USING (public.is_super_admin_user());

-- No UPDATE policy = immutable logs

CREATE INDEX idx_diagnostics_logs_created_at ON public.diagnostics_logs (created_at DESC);
CREATE INDEX idx_diagnostics_logs_category ON public.diagnostics_logs (category);
CREATE INDEX idx_diagnostics_logs_severity ON public.diagnostics_logs (severity);
CREATE INDEX idx_diagnostics_logs_user_id ON public.diagnostics_logs (user_id);