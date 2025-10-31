-- Add RLS policy to protect service pricing from unauthenticated access
-- This ensures only authenticated users can view detailed pricing information

-- Create policy to restrict services table access to authenticated users only
CREATE POLICY "Authenticated users can view services"
ON services FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add comment to document the security rationale
COMMENT ON POLICY "Authenticated users can view services" ON services IS 
'Security: Restricts access to service pricing and details to authenticated users only. Public users should use public_service_catalog table which has limited information.';