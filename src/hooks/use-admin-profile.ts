
import { supabase } from '@/integrations/supabase/client';
import { permissionManager } from '@/utils/securityManager';

/**
 * SECURITY: This hook is DEPRECATED and should not be used.
 * Admin roles are now managed through the user_roles table only.
 * Use permissionManager.isAdmin() or permissionManager.isSuperAdmin() instead.
 */
export function useAdminProfile() {
  // DEPRECATED: Admin profiles should be managed through proper RBAC, not client-side
  const createAdminProfile = async (userId: string, email: string) => {
    console.warn('⚠️ DEPRECATED: createAdminProfile is deprecated. Use proper admin management instead.');
    
    // Check if user has admin role via RBAC
    const isAdmin = await permissionManager.isAdmin(userId);
    return isAdmin;
  };

  const isAdminEmail = (email: string) => {
    console.warn('⚠️ DEPRECATED: isAdminEmail is deprecated. Use RBAC checks instead.');
    return false;
  };

  return {
    createAdminProfile,
    isAdminEmail,
    ADMIN_EMAIL: '' // Deprecated
  };
}
