
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_referral_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_referral(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.qualify_referral(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_referral_credit(uuid, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.ensure_referral_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.qualify_referral(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_referral_credit(uuid, integer) TO service_role;
