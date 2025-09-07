
import { useAuthSession } from './use-auth-session';
import { useAuthActions } from './use-auth-actions';
import { useUserProfile } from './use-user-profile';
import { useMemo, useEffect, useState } from 'react';
import { permissionManager } from '@/utils/securityManager';

export function useAuthState() {
  const { user, loading: sessionLoading } = useAuthSession();
  const { signIn, signOut, loading: actionsLoading } = useAuthActions();
  const { userData } = useUserProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  
  // Check user permissions using new RBAC system
  useEffect(() => {
    async function checkPermissions() {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }

      setPermissionsLoading(true);
      try {
        const [adminCheck, superAdminCheck] = await Promise.all([
          permissionManager.isAdmin(user.id),
          permissionManager.isSuperAdmin(user.id)
        ]);

        setIsAdmin(adminCheck);
        setIsSuperAdmin(superAdminCheck);
      } catch (error) {
        console.error('Failed to check permissions:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        setPermissionsLoading(false);
      }
    }

    checkPermissions();
  }, [user?.id]);
  
  // Combine loading states
  const loading = sessionLoading || actionsLoading || permissionsLoading;

  // Log the current auth state for debugging
  console.log('[useAuthState] Current auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAdmin,
    isSuperAdmin,
    loading
  });

  return {
    user,
    userData,
    loading,
    isAdmin,
    isSuperAdmin,
    signIn,
    signOut,
    // Backward compatibility
    ADMIN_EMAILS: [] // Deprecated - now using RBAC
  };
}
