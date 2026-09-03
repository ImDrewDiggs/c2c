DROP POLICY IF EXISTS "Authenticated users can read role permissions" ON public.role_permissions;

CREATE POLICY "Admins can read role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin_user());