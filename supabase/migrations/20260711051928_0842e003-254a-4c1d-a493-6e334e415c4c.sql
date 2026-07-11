
-- Referral codes: one per user, auto-generated
CREATE TABLE public.referral_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referral code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all referral codes"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- Referrals: tracks who referred whom
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_email text,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','qualified','rewarded','cancelled')),
  reward_amount_cents integer NOT NULL DEFAULT 2000,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referee_user_id)
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals as referrer"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Admins view all referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- Credit balance per user
CREATE TABLE public.referral_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents integer NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  lifetime_earned_cents integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_credits TO authenticated;
GRANT ALL ON public.referral_credits TO service_role;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits"
  ON public.referral_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all credits"
  ON public.referral_credits FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- Credit ledger (append-only history)
CREATE TABLE public.referral_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta_cents integer NOT NULL,
  reason text NOT NULL,
  related_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_credit_ledger TO authenticated;
GRANT ALL ON public.referral_credit_ledger TO service_role;
ALTER TABLE public.referral_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ledger"
  ON public.referral_credit_ledger FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all ledger"
  ON public.referral_credit_ledger FOR SELECT TO authenticated
  USING (public.is_admin_user());

-- Function: generate a unique 8-char referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  LOOP
    new_code := upper(substr(encode(gen_random_bytes(6), 'base64'), 1, 8));
    new_code := regexp_replace(new_code, '[^A-Z0-9]', 'X', 'g');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function: ensure a user has a referral code (self-service)
CREATE OR REPLACE FUNCTION public.ensure_referral_code(_user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing text;
  new_code text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT code INTO existing FROM public.referral_codes WHERE user_id = _user_id;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;

  new_code := public.generate_referral_code();
  INSERT INTO public.referral_codes (user_id, code) VALUES (_user_id, new_code);

  -- Initialize credit row
  INSERT INTO public.referral_credits (user_id, balance_cents)
  VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_code;
END;
$$;

-- Function: record a referral (called from client at signup)
CREATE OR REPLACE FUNCTION public.record_referral(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  referrer_id uuid;
  current_email text;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  IF _code IS NULL OR length(_code) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Missing code');
  END IF;

  -- Already referred? no-op
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referee_user_id = current_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already referred');
  END IF;

  SELECT user_id INTO referrer_id FROM public.referral_codes WHERE code = upper(_code);
  IF referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid code');
  END IF;

  IF referrer_id = current_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot refer yourself');
  END IF;

  SELECT email INTO current_email FROM public.profiles WHERE id = current_user_id;

  INSERT INTO public.referrals (referrer_user_id, referee_user_id, referee_email, code, status)
  VALUES (referrer_id, current_user_id, current_email, upper(_code), 'pending');

  -- Ensure referee has credit row for the $20 welcome credit
  INSERT INTO public.referral_credits (user_id, balance_cents, lifetime_earned_cents)
  VALUES (current_user_id, 2000, 2000)
  ON CONFLICT (user_id) DO UPDATE SET
    balance_cents = public.referral_credits.balance_cents + 2000,
    lifetime_earned_cents = public.referral_credits.lifetime_earned_cents + 2000,
    updated_at = now();

  INSERT INTO public.referral_credit_ledger (user_id, delta_cents, reason)
  VALUES (current_user_id, 2000, 'Welcome credit from referral');

  RETURN jsonb_build_object('success', true, 'message', 'Referral recorded, $20 welcome credit applied');
END;
$$;

-- Function: reward referrer when referee makes first qualified payment
-- Called from edge functions (service_role) after successful checkout
CREATE OR REPLACE FUNCTION public.qualify_referral(_referee_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_row public.referrals%ROWTYPE;
BEGIN
  SELECT * INTO ref_row FROM public.referrals
  WHERE referee_user_id = _referee_user_id
    AND status = 'pending'
  LIMIT 1;

  IF ref_row.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No pending referral');
  END IF;

  -- Credit the referrer
  INSERT INTO public.referral_credits (user_id, balance_cents, lifetime_earned_cents)
  VALUES (ref_row.referrer_user_id, ref_row.reward_amount_cents, ref_row.reward_amount_cents)
  ON CONFLICT (user_id) DO UPDATE SET
    balance_cents = public.referral_credits.balance_cents + ref_row.reward_amount_cents,
    lifetime_earned_cents = public.referral_credits.lifetime_earned_cents + ref_row.reward_amount_cents,
    updated_at = now();

  INSERT INTO public.referral_credit_ledger (user_id, delta_cents, reason, related_referral_id)
  VALUES (ref_row.referrer_user_id, ref_row.reward_amount_cents, 'Referral reward - friend subscribed', ref_row.id);

  UPDATE public.referrals
  SET status = 'rewarded', qualified_at = now(), rewarded_at = now()
  WHERE id = ref_row.id;

  RETURN jsonb_build_object('success', true, 'referrer_id', ref_row.referrer_user_id, 'amount_cents', ref_row.reward_amount_cents);
END;
$$;

-- Function: consume credit at checkout (returns amount applied, updates balance)
CREATE OR REPLACE FUNCTION public.consume_referral_credit(_user_id uuid, _max_cents integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  to_apply integer;
BEGIN
  SELECT balance_cents INTO current_balance FROM public.referral_credits WHERE user_id = _user_id FOR UPDATE;
  IF current_balance IS NULL OR current_balance <= 0 THEN
    RETURN 0;
  END IF;

  to_apply := LEAST(current_balance, GREATEST(_max_cents, 0));
  IF to_apply <= 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.referral_credits
  SET balance_cents = balance_cents - to_apply, updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.referral_credit_ledger (user_id, delta_cents, reason)
  VALUES (_user_id, -to_apply, 'Credit applied to checkout');

  RETURN to_apply;
END;
$$;
