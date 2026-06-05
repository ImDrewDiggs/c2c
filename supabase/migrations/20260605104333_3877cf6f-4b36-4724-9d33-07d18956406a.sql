REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_manager(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_org_owner_as_member() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_org_manager(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_org_owner_as_member() TO service_role;
