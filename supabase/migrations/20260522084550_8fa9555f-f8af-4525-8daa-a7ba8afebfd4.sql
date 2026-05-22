-- Attach super-admin escalation trigger (function already exists)
DROP TRIGGER IF EXISTS trg_prevent_super_admin_escalation ON public.user_roles;
CREATE TRIGGER trg_prevent_super_admin_escalation
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_escalation();

-- Defense-in-depth: ensure Stripe identifier columns are not selectable by client roles
REVOKE SELECT (stripe_session_id, stripe_payment_intent_id) ON public.orders FROM anon, authenticated;
REVOKE SELECT (stripe_customer_id) ON public.subscribers FROM anon, authenticated;
