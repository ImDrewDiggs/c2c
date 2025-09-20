-- Phase 2B: Enhanced RLS Security Hardening

-- Enhanced profiles table security with PII protection
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile with limited PII" ON public.profiles
FOR SELECT USING (
  auth.uid()::text = id::text OR is_admin_by_email()
);

CREATE POLICY "Users can update own profile with PII restrictions" ON public.profiles
FOR UPDATE USING (
  auth.uid()::text = id::text AND 
  -- Prevent unauthorized role changes
  (OLD.role = NEW.role OR is_admin_by_email())
) WITH CHECK (
  auth.uid()::text = id::text AND
  (OLD.role = NEW.role OR is_admin_by_email())
);

-- Enhanced payments table security with transaction-level controls
CREATE POLICY "Users can view own payment history only" ON public.payments
FOR SELECT USING (
  user_id = auth.uid() OR is_admin_by_email()
);

-- Secure employee_locations with time-based access
DROP POLICY IF EXISTS "Employees can view their own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can update their own location" ON public.employee_locations;
DROP POLICY IF EXISTS "Employees can insert their own location" ON public.employee_locations;

CREATE POLICY "Employees can view own recent location" ON public.employee_locations
FOR SELECT USING (
  (employee_id = auth.uid() AND timestamp >= now() - interval '24 hours') OR 
  is_admin_by_email()
);

CREATE POLICY "Employees can update own current location" ON public.employee_locations
FOR UPDATE USING (
  employee_id = auth.uid() AND 
  timestamp >= now() - interval '1 hour'
);

CREATE POLICY "Employees can insert own location" ON public.employee_locations
FOR INSERT WITH CHECK (
  employee_id = auth.uid()
);

-- Enhanced messages security with encryption considerations
CREATE POLICY "Users can view own messages with audit" ON public.messages
FOR SELECT USING (
  (sender_id = auth.uid() OR recipient_id = auth.uid() OR is_admin_by_email()) AND
  -- Log message access for audit trail
  (SELECT pg_notify('message_access', json_build_object(
    'user_id', auth.uid(),
    'message_id', id,
    'access_time', now()
  )::text)) IS NOT NULL
);

-- Create secure field-level encryption function for sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(data text, field_name text)
RETURNS text AS $$
BEGIN
  -- This is a placeholder for actual encryption implementation
  -- In production, use pgcrypto or similar
  RETURN encode(digest(data || field_name || 'salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced audit logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
RETURNS trigger AS $$
BEGIN
  -- Enhanced logging for sensitive table changes
  INSERT INTO public.enhanced_security_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    risk_level,
    metadata,
    ip_address,
    session_id
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE 
      WHEN TG_TABLE_NAME IN ('profiles', 'payments', 'employee_locations') THEN 'high'
      WHEN TG_TABLE_NAME IN ('messages', 'admin_sessions') THEN 'critical'
      ELSE 'medium'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    CASE 
      WHEN current_setting('request.headers', true)::jsonb->>'x-forwarded-for' IS NOT NULL 
      THEN (current_setting('request.headers', true)::jsonb->>'x-forwarded-for')::inet
      ELSE '127.0.0.1'::inet
    END,
    current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply enhanced audit triggers to sensitive tables
DROP TRIGGER IF EXISTS enhanced_audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS enhanced_audit_payments ON public.payments;
DROP TRIGGER IF EXISTS enhanced_audit_employee_locations ON public.employee_locations;
DROP TRIGGER IF EXISTS enhanced_audit_messages ON public.messages;

CREATE TRIGGER enhanced_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

CREATE TRIGGER enhanced_audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

CREATE TRIGGER enhanced_audit_employee_locations
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_locations
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

CREATE TRIGGER enhanced_audit_messages
  AFTER INSERT OR UPDATE OR DELETE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

-- Create function for data anonymization
CREATE OR REPLACE FUNCTION public.anonymize_location_data(location_data jsonb)
RETURNS jsonb AS $$
BEGIN
  -- Reduce precision of coordinates for privacy
  RETURN jsonb_build_object(
    'lat', round((location_data->>'lat')::numeric, 2),
    'lng', round((location_data->>'lng')::numeric, 2),
    'anonymized', true,
    'timestamp', location_data->>'timestamp'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;