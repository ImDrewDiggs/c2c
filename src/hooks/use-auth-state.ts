
import { useAuthSession } from './use-auth-session';
import { useAuthActions } from './use-auth-actions';
import { useUserProfile } from './use-user-profile';

export function useAuthState() {
  const { user, loading: sessionLoading } = useAuthSession();
  const { signIn, signOut, loading: actionsLoading } = useAuthActions();
  const { userData, isSuperAdmin } = useUserProfile();
  
  // Combine loading states
  const loading = sessionLoading || actionsLoading;

  return {
    user,
    userData,
    loading,
    isSuperAdmin,
    signIn,
    signOut
  };
}
