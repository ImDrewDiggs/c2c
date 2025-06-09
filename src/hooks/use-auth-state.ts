
import { useAuthSession } from './use-auth-session';
import { useAuthActions } from './use-auth-actions';
import { useUserProfile } from './use-user-profile';
import { useMemo } from 'react';
import { AuthService } from '@/services/AuthService';

export function useAuthState() {
  const { user, loading: sessionLoading } = useAuthSession();
  const { signIn, signOut, loading: actionsLoading } = useAuthActions();
  const { userData, isSuperAdmin, ADMIN_EMAILS } = useUserProfile();
  
  // Determine if user is admin - directly by email or by profile status
  const isAdminUser = useMemo(() => 
    AuthService.isAdminEmail(user?.email) || isSuperAdmin,
  [user?.email, isSuperAdmin]);
  
  // Combine loading states
  const loading = sessionLoading || actionsLoading;

  // Log the current auth state for debugging
  console.log('[useAuthState] Current auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAdminEmail: AuthService.isAdminEmail(user?.email),
    isSuperAdmin,
    isAdminUser
  });

  return {
    user,
    userData,
    loading,
    isAdmin: isAdminUser,
    isSuperAdmin: isAdminUser, // Ensure isSuperAdmin reflects combined admin status
    signIn,
    signOut,
    ADMIN_EMAILS
  };
}
