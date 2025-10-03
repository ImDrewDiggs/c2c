# Can2Curb Security Documentation

## Recent Security Updates

**Last Updated:** 2025-10-03

### Critical Security Fixes Implemented

1. **Role-Based Access Control (RBAC) Consolidation**
   - Removed hardcoded email-based admin authentication
   - All admin checks now use the `user_roles` table exclusively
   - `is_admin_by_email()` function updated to query `user_roles` instead of hardcoded emails

2. **PII Protection Enhancements**
   - Implemented column-level security for `pay_rate` in profiles table
   - Only super admins and the employee themselves can view pay rates
   - Enhanced RLS policies for better data isolation

3. **Payment Data Security**
   - Removed email fallback from `subscribers` table RLS policies
   - Subscriptions now require `user_id` match only (no email bypass)
   - Strengthened protection for Stripe customer data

4. **Configuration Security**
   - Restricted `site_settings` modifications to super admins only
   - Regular admins can read settings but cannot modify them

5. **Location Data Privacy**
   - Added `cleanup_old_employee_locations()` function
   - Automatically anonymizes location data older than 7 days
   - Deletes location data older than 30 days
   - Complies with data retention best practices

## Required Manual Configuration

### Supabase Dashboard Settings

The following settings must be configured in your Supabase Dashboard for optimal security:

1. **Enable Leaked Password Protection**
   - Navigate to: Authentication → Providers → Email
   - Enable "Check for leaked passwords"
   - Documentation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

2. **Reduce OTP Expiry Time**
   - Navigate to: Authentication → Email Templates
   - Set OTP expiry to 10 minutes (600 seconds)
   - Default is too long and poses security risk
   - Documentation: https://supabase.com/docs/guides/platform/going-into-prod#security

3. **Schedule PostgreSQL Upgrade**
   - Navigate to: Settings → Database
   - Check for available security patches
   - Schedule upgrade during low-traffic period
   - Documentation: https://supabase.com/docs/guides/platform/upgrading

### Location Data Cleanup Schedule

The `cleanup_old_employee_locations()` function should be run daily. You have two options:

#### Option 1: Using pg_cron (Recommended)

Enable pg_cron in your Supabase project and create a scheduled job:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'cleanup-employee-locations',
  '0 2 * * *', -- 2 AM every day
  $$
  SELECT public.cleanup_old_employee_locations();
  $$
);
```

#### Option 2: Using Supabase Edge Function + Cron

Create an edge function and trigger it daily using pg_net:

```sql
SELECT
  cron.schedule(
    'cleanup-employee-locations',
    '0 2 * * *', -- 2 AM every day
    $$
    SELECT
      net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-locations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
```

## Security Best Practices

### Admin User Management

1. **Creating Admin Users**
   - Admin roles are assigned via the `user_roles` table
   - Only super admins can assign admin and super_admin roles
   - Never use hardcoded emails for admin checks

2. **Checking Admin Status**
   ```typescript
   // ✅ CORRECT - Use permissionManager
   import { permissionManager } from '@/utils/securityManager';
   const isAdmin = await permissionManager.isAdmin();
   const isSuperAdmin = await permissionManager.isSuperAdmin();
   
   // ❌ DEPRECATED - Don't use email checks
   import { isAdminEmail } from '@/utils/secureAdminSetup';
   const isAdmin = isAdminEmail(user.email); // DEPRECATED
   ```

3. **Using Hooks**
   ```typescript
   // ✅ CORRECT - Use useAuthState hook
   import { useAuthState } from '@/hooks/use-auth-state';
   const { isAdmin, isSuperAdmin } = useAuthState();
   ```

### Data Access Patterns

1. **Viewing Pay Rates**
   - Super admins: Can view all pay rates
   - Employees: Can view only their own pay rate
   - Regular admins: Cannot view pay rates

2. **Subscription Data**
   - Users must be authenticated
   - Access via `user_id` match only
   - No email-based access fallback

3. **Employee Location Data**
   - Admins can view all current locations
   - Employees can view their own recent locations (24 hours)
   - Historical data is automatically anonymized after 7 days
   - All data older than 30 days is deleted

### Audit Logging

All sensitive operations are automatically logged to `enhanced_security_logs`:
- Admin role changes
- Profile modifications
- Payment operations
- Location data access
- Site settings changes

## Security Monitoring

### Regular Checks

1. **Review Audit Logs**
   ```sql
   SELECT * FROM enhanced_security_logs
   WHERE risk_level IN ('high', 'critical')
   ORDER BY created_at DESC
   LIMIT 100;
   ```

2. **Check Active Admin Sessions**
   ```sql
   SELECT * FROM admin_sessions
   WHERE is_active = true
   ORDER BY last_activity DESC;
   ```

3. **Monitor Rate Limiting**
   ```sql
   SELECT * FROM rate_limits
   WHERE is_blocked = true
   ORDER BY updated_at DESC;
   ```

### Incident Response

If suspicious activity is detected:

1. Use `emergency_disable_admin(target_admin_id)` to immediately disable a compromised admin account
2. Review `enhanced_security_logs` for the user's recent activity
3. Check `admin_sessions` to identify active sessions
4. Update passwords and revoke access tokens as needed

## Compliance

### Data Retention
- Employee location data: 30 days (anonymized after 7 days)
- Audit logs: Indefinite retention for compliance
- Payment records: Indefinite retention for financial compliance

### Privacy
- PII access is restricted via RLS policies
- Pay rates require super admin privileges
- Location data is automatically anonymized
- All sensitive operations are audited

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth/password-security)

## Support

For security concerns or questions, please:
1. Review this documentation
2. Check the Supabase documentation
3. Contact your system administrator
4. For critical issues, use emergency procedures outlined above
