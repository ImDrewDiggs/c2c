-- Create terms acceptance tracking table
CREATE TABLE IF NOT EXISTS public.terms_acceptance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Links to Supabase user if logged in
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- For anonymous sessions (cookie or JWT-based)
  session_id text,
  
  -- Audit trail
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  referer text,
  
  -- Additional security fields
  terms_version text DEFAULT '1.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_terms_user_id ON public.terms_acceptance (user_id);
CREATE INDEX IF NOT EXISTS idx_terms_session_id ON public.terms_acceptance (session_id);
CREATE INDEX IF NOT EXISTS idx_terms_ip_address ON public.terms_acceptance (ip_address);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_at ON public.terms_acceptance (accepted_at);

-- RLS policies
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Users can view their own acceptance records
CREATE POLICY "Users can view their own terms acceptance" ON public.terms_acceptance
  FOR SELECT USING (
    auth.uid() = user_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
  );

-- Anyone can insert terms acceptance (for anonymous users)
CREATE POLICY "Anyone can record terms acceptance" ON public.terms_acceptance
  FOR INSERT WITH CHECK (true);

-- Admins can view all records
CREATE POLICY "Admins can view all terms acceptance" ON public.terms_acceptance
  FOR ALL USING (is_admin_by_email());

-- Function to check if user/session has accepted terms
CREATE OR REPLACE FUNCTION public.has_accepted_terms(check_session_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  acceptance_exists boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if authenticated user has accepted
  IF current_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.terms_acceptance 
      WHERE user_id = current_user_id
    ) INTO acceptance_exists;
  END IF;
  
  -- If not authenticated or no user acceptance, check session
  IF NOT acceptance_exists AND check_session_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.terms_acceptance 
      WHERE session_id = check_session_id
    ) INTO acceptance_exists;
  END IF;
  
  RETURN acceptance_exists;
END;
$$;

-- Function to record terms acceptance
CREATE OR REPLACE FUNCTION public.record_terms_acceptance(
  p_session_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referer text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_record_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Insert acceptance record
  INSERT INTO public.terms_acceptance (
    user_id,
    session_id,
    ip_address,
    user_agent,
    referer
  ) VALUES (
    current_user_id,
    p_session_id,
    p_ip_address::inet,
    p_user_agent,
    p_referer
  ) RETURNING id INTO new_record_id;
  
  -- Log this security event
  INSERT INTO public.enhanced_security_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    risk_level,
    metadata
  ) VALUES (
    current_user_id,
    'terms_acceptance',
    'legal_agreement',
    new_record_id,
    'medium',
    jsonb_build_object(
      'session_id', p_session_id,
      'ip_address', p_ip_address,
      'user_agent', p_user_agent,
      'timestamp', now()
    )
  );
  
  RETURN new_record_id;
END;
$$;

-- Update trigger for terms_acceptance
CREATE TRIGGER update_terms_acceptance_updated_at
  BEFORE UPDATE ON public.terms_acceptance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();