
import { useAuthSession } from './use-auth-session';
import { useAuthActions } from './use-auth-actions';
import { useUserProfile } from './use-user-profile';

export function useAuthState() {
  const { user, loading: sessionLoading } = useAuthSession();
  const { signIn, signOut, loading: actionsLoading } = useAuthActions();
  const { userData, isSuperAdmin, ADMIN_EMAIL } = useUserProfile();
  
  // Determine if user is admin - directly by email or by profile status
  const isAdminUser = user?.email === ADMIN_EMAIL || isSuperAdmin;
  
  // Combine loading states
  const loading = sessionLoading || actionsLoading;

  // Log the current auth state for debugging
  console.log('[useAuthState] Current auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAdminEmail: user?.email === ADMIN_EMAIL,
    isSuperAdmin,
    isAdminUser
  });

  return {
    user,
    userData,
    loading,
    isSuperAdmin: isAdminUser, // Ensure isSuperAdmin reflects combined admin status
    signIn,
    signOut,
    ADMIN_EMAIL
  };
}
