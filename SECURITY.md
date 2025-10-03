# Can2Curb Security Documentation

## Critical Security Fixes Applied

### ✅ Completed Security Fixes

#### 1. RBAC System Consolidation (CRITICAL)
**Issue**: Admin authentication was using hardcoded email addresses.

**Fix**: Updated `is_admin_by_email()` to check `user_roles` table instead of hardcoded emails.

---

#### 2. Subscriber Data Access Control (CRITICAL)
**Fix**: Removed email-based access fallback. Now requires `user_id` match only.

---

#### 3. Site Settings Protection (HIGH)
**Fix**: Restricted modifications to super admins only. Regular admins have read-only access.

---

#### 4. Employee Location Privacy (MEDIUM)
**Fix**: Created `cleanup_old_employee_locations()` function that anonymizes locations older than 7 days and deletes those older than 30 days.

**Setup Required**: Schedule this function to run daily (see below).

---

## Ongoing Security Maintenance

### Daily Location Data Cleanup (Required)

Enable pg_cron in Supabase and add:

\`\`\`sql
SELECT cron.schedule(
  'cleanup-employee-locations',
  '0 2 * * *',  -- Run at 2 AM daily
  $$SELECT public.cleanup_old_employee_locations();$$
);
\`\`\`

---

### Supabase Dashboard Configuration (Required)

⚠️ **Update these settings in your Supabase Dashboard**:

1. **Enable Leaked Password Protection**: Authentication > Settings > Password
2. **Reduce OTP Expiry**: Set to 10 minutes in Authentication > Settings
3. **Schedule PostgreSQL Upgrade**: Settings > Infrastructure

---

## Security Best Practices

### For Developers

\`\`\`typescript
// ✅ DO - Use RBAC
if (await permissionManager.isAdmin(user.id))

// ❌ DON'T - Hardcode emails
if (user.email === 'admin@example.com')
\`\`\`

### For Administrators

- Use super admin role sparingly
- Monitor `enhanced_security_logs` weekly
- Review location cleanup logs monthly

---

**Last Updated**: ${new Date().toISOString()}
