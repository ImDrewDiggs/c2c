DROP POLICY IF EXISTS "Authenticated system can insert security logs" ON public.enhanced_security_logs;
CREATE POLICY "Users can insert their own security logs"
ON public.enhanced_security_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
CREATE POLICY "Authenticated users can view active services"
ON public.services FOR SELECT TO authenticated
USING (is_active = true);