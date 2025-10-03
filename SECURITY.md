# Can2Curb Security Documentation

## Overview
This document outlines the security measures implemented in the Can2Curb application and provides guidance for maintaining security.

## Critical Security Fixes Applied

### 1. Role-Based Access Control (RBAC)
- **Implementation**: All admin checks now use the `user_roles` table instead of hardcoded emails
- **Function**: `is_admin_by_email()` now queries the `user_roles` table
- **Client Code**: Use `permissionManager` from `securityManager.ts` for all permission checks
- **Deprecated**: Email-based admin checks in `secureAdminSetup.ts`

### 2. PII Protection
- **Pay Rate Security**: Column-level RLS restricts `pay_rate` viewing to:
  - Super admins (full access)
  - Employees viewing their own data
- **Profile Access**: Users can view their own profiles, admins can view all profiles
- **Audit Logging**: All sensitive data access is logged in `enhanced_security_logs`

### 3. Payment Data Security
- **Subscribers Table**: RLS policies now require `user_id` match (email fallback removed)
- **Stripe Integration**: Webhook signature verification required for all payment events
- **Rate Limiting**: Implemented via `DatabaseRateLimiter` to prevent abuse

### 4. Site Settings Protection
- **Modification**: Only super admins can modify site settings
- **Read Access**: Regular admins can read settings but not modify them
- **Audit Trail**: All changes to site settings are logged

### 5. Location Data Privacy
- **Retention Policy**: 
  - Locations older than 7 days are anonymized (precision reduced to 2 decimals)
  - Locations older than 30 days are automatically deleted
- **Function**: `cleanup_old_employee_locations()` should be run daily via cron job
- **Setup**: See "Scheduled Tasks" section below

## Required Supabase Configuration

### Immediate Actions Needed

1. **Enable Leaked Password Protection**
   - Navigate to: Authentication > Settings
   - Enable "Leaked Password Protection"
   - This prevents users from using compromised passwords

2. **Reduce OTP Expiry Time**
   - Current: 1 hour (default)
   - Recommended: 10 minutes
   - Navigate to: Authentication > Settings > OTP Expiry

3. **Schedule PostgreSQL Upgrade**
   - Current version: Check in dashboard
   - Recommended: Latest stable version
   - Navigate to: Database > Settings

## Scheduled Tasks

### Location Data Cleanup (Daily)

To automatically clean up old location data, set up a daily cron job:

1. Enable `pg_cron` extension in Supabase:
```sql
-- Run in SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

2. Create the scheduled job:
```sql
-- Run daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-locations',
  '0 2 * * *',
  $$SELECT public.cleanup_old_employee_locations();$$
);
```

3. Verify the job was created:
```sql
SELECT * FROM cron.job;
```

## Security Best Practices

### Authentication
- Never check admin status client-side using localStorage/sessionStorage
- Always use `permissionManager` for permission checks
- Implement rate limiting on login attempts
- Use MFA for admin accounts

### Data Access
- All sensitive queries must use security definer functions
- Implement RLS policies on all tables containing PII
- Use column-level security for highly sensitive data (e.g., pay_rate)
- Log all access to sensitive data

### API Security
- Validate all inputs using zod schemas
- Implement rate limiting on all API endpoints
- Use prepared statements to prevent SQL injection
- Validate webhook signatures for third-party integrations

### Audit Logging
- All security-relevant events are logged in `enhanced_security_logs`
- Review logs regularly for suspicious activity
- Set up alerts for critical security events

## Permissions Overview

### User Roles
- **customer**: Basic customer access
- **employee**: Field worker access + location tracking
- **admin**: Administrative access to manage operations
- **super_admin**: Full system access including configuration

### Permission Checks
```typescript
// Check if user is admin
const isAdmin = await permissionManager.isAdmin();

// Check if user is super admin
const isSuperAdmin = await permissionManager.isSuperAdmin();

// Check specific permission
const canManageUsers = await permissionManager.hasPermission('manage_users');

// Get all user roles
const roles = await permissionManager.getUserRoles();
```

## Security Monitoring

### Enhanced Security Logs
Monitor the `enhanced_security_logs` table for:
- Failed login attempts
- Unauthorized access attempts
- Role changes
- Sensitive data access
- Configuration changes

### Risk Levels
- **low**: Normal operations
- **medium**: Elevated activity
- **high**: Sensitive data access, role changes
- **critical**: Security incidents, admin actions

## Incident Response

If a security incident occurs:

1. **Immediate Actions**
   - Review `enhanced_security_logs` for the incident timeline
   - Identify affected users/data
   - Use `emergency_disable_admin()` function if admin account is compromised

2. **Investigation**
   - Review audit logs for the affected time period
   - Check for unauthorized data access
   - Verify all role assignments

3. **Remediation**
   - Reset affected user credentials
   - Review and update RLS policies if needed
   - Update security documentation

## Contact

For security concerns or to report vulnerabilities:
- Email: security@can2curb.com (configure in production)
- Document all incidents in `enhanced_security_logs`

## Last Updated
Security documentation last updated: 2025-10-03

---

**Note**: This is a living document. Update it whenever security measures are added or modified.
