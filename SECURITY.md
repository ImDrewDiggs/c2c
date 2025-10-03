# Can2Curb Security Documentation

## 🔒 Security Implementation Overview

This document outlines the security measures implemented in the Can2Curb application and provides guidance for administrators.

## Critical Security Fixes Applied

### ✅ 1. RBAC-Based Admin Authentication
**Status:** IMPLEMENTED

- **Old System:** Hardcoded email addresses in `isAdminEmail()` function
- **New System:** Role-Based Access Control (RBAC) using `user_roles` table
- **Database Function:** `is_admin_by_email()` now checks `user_roles` table exclusively
- **Client Code:** Uses `permissionManager` for all permission checks

**Action Required:** None - All admin checks now use the RBAC system.

---

### ✅ 2. Payment Data Security (Subscribers Table)
**Status:** IMPLEMENTED

- **Vulnerability Fixed:** Removed email-based access fallback
- **RLS Policies Updated:**
  - Users can only access subscriptions via `user_id` (email fallback removed)
  - `stripe_customer_id` is protected by user-specific RLS policies
  - Admins have separate read-only access

**Action Required:** None - Stripe payment data is now properly secured.

---

### ✅ 3. Site Settings Protection
**Status:** IMPLEMENTED

- **Change:** Restricted write access to super admins only
- **RLS Policies:**
  - Only `super_admin` role can INSERT/UPDATE/DELETE site settings
  - Regular `admin` role has read-only access

**Action Required:** None - Configuration changes require super admin privileges.

---

### ✅ 4. Employee PII Protection
**Status:** IMPLEMENTED

- **Enhancement:** Column-level security for `pay_rate` field
- **Access Control:**
  - Employees can view their own `pay_rate`
  - Only `super_admin` can view all employees' `pay_rate`
  - Regular admins cannot access salary information

**Action Required:** None - Pay rate data is protected with granular RLS.

---

### ✅ 5. Location Data Privacy
**Status:** IMPLEMENTED

**Data Retention Function:** `cleanup_old_employee_locations()`
- Anonymizes location data older than 7 days (reduces GPS precision)
- Deletes location data older than 30 days
- Logs all cleanup actions to `enhanced_security_logs`

**Setup Required:**

To enable automatic cleanup, you need to set up a scheduled task:

1. **Enable pg_cron extension in Supabase:**
   - Navigate to Database → Extensions in Supabase Dashboard
   - Enable `pg_cron` extension

2. **Create the scheduled job:**
   ```sql
   SELECT cron.schedule(
     'cleanup-employee-locations',
     '0 2 * * *', -- Run daily at 2 AM
     $$
     SELECT cleanup_old_employee_locations();
     $$
   );
   ```

3. **Verify the job:**
   ```sql
   SELECT * FROM cron.job;
   ```

---

## ⚠️ Required Supabase Dashboard Configuration

The following security settings need to be updated in your Supabase Dashboard:

### 1. Reduce OTP Expiry (RECOMMENDED)
**Current:** Default expiry is too long  
**Recommended:** 10 minutes

**How to Fix:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "OTP Expiry" setting
3. Change to 600 seconds (10 minutes)
4. Save changes

📖 [Learn more](https://supabase.com/docs/guides/platform/going-into-prod#security)

---

### 2. Enable Leaked Password Protection (CRITICAL)
**Current:** Disabled  
**Recommended:** Enabled

**How to Fix:**
1. Go to Supabase Dashboard → Authentication → Policies
2. Enable "Leaked Password Protection"
3. Save changes

📖 [Learn more](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

### 3. Upgrade PostgreSQL Version (RECOMMENDED)
**Current:** Running older version with known security patches  
**Recommended:** Latest stable version

**How to Fix:**
1. Go to Supabase Dashboard → Database → Settings
2. Follow the upgrade wizard
3. Schedule upgrade during low-traffic period

📖 [Learn more](https://supabase.com/docs/guides/platform/upgrading)

---

## 🛡️ Security Features

### Audit Logging
- Table: `enhanced_security_logs`
- Logs all security-critical actions
- Risk levels: low, medium, high, critical

### Rate Limiting
- Database-backed via `rate_limits` table
- Function: `check_rate_limit()`

### Input Validation
- Zod schemas for all user inputs
- Protection against SQL injection and XSS

### Session Management
- `SessionManager` class
- Admin session tracking
- Activity monitoring

### Field-Level Encryption
- Driver's license numbers
- SHA-256 with salting

---

## 📋 Security Checklist

### Daily
- [ ] Monitor `enhanced_security_logs` for suspicious activity
- [ ] Review failed login attempts

### Weekly
- [ ] Audit active `admin_sessions`
- [ ] Review new user registrations

### Monthly
- [ ] Review user roles
- [ ] Audit RLS policies
- [ ] Review security documentation

---

## 🚨 Incident Response

### Suspected Breach
1. Disable affected accounts via `user_roles.is_active = false`
2. Check `enhanced_security_logs`
3. Review `admin_sessions`

### Emergency Admin Disable
```sql
SELECT emergency_disable_admin('user-id-here');
```

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod)
