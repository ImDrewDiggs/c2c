
import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useRouteProtection } from '@/hooks/use-route-protection';
import { UserRole } from '@/lib/supabase';
import { useAdminProfile } from '@/hooks/use-admin-profile';

// Define protected routes by role
const roleBasedRoutes: Record<UserRole, string[]> = {
  customer: ['/customer'],
  employee: ['/employee'],
  admin: ['/admin']
};

// Define public routes that should never trigger auth redirection
const publicRoutes = ['/', '/about', '/testimonials', '/services-and-prices', '/subscription', '/faq', '/contact', '/customer/login', '/customer/register', '/employee/login', '/admin/login'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { ADMIN_EMAIL } = useAdminProfile();
  
  console.log('[DIAGNOSTIC][AuthContext] AuthProvider initialized');

  // Use our custom hooks
  const {
    user,
    userData,
    loading,
    isSuperAdmin,
    signIn,
    signOut
  } = useAuthState();

  useEffect(() => {
    console.log('[DIAGNOSTIC][AuthContext] AuthProvider useEffect - auth state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasUserData: !!userData,
      userRole: userData?.role,
      isSuperAdmin,
      isLoading: loading
    });
    
    // Special case for admin email - force set admin privileges
    if (user?.email === ADMIN_EMAIL && !isSuperAdmin) {
      console.log('[DIAGNOSTIC][AuthContext] Admin email detected but not flagged as admin. Forcing admin status.');
      // The hook will handle this automatically, just log for transparency
    }
  }, [user, userData, isSuperAdmin, loading, ADMIN_EMAIL]);

  const { redirectBasedOnRole } = useRouteProtection(
    loading,
    user,
    userData,
    isSuperAdmin,
    { publicRoutes, roleBasedRoutes, adminEmail: ADMIN_EMAIL }
  );

  // Wrap signIn to handle redirection after successful login
  const handleSignIn = async (email: string, password: string, role: UserRole) => {
    console.log('[DIAGNOSTIC][AuthContext] handleSignIn called for email:', email, 'role:', role);
    await signIn(email, password, role);
    
    // Special handling for admin email - always redirect to admin dashboard
    if (email === ADMIN_EMAIL) {
      console.log('[DIAGNOSTIC][AuthContext] Admin login detected, redirecting to admin dashboard');
      navigate('/admin/dashboard');
      return;
    }
    
    console.log('[DIAGNOSTIC][AuthContext] Redirecting based on role:', role);
    redirectBasedOnRole(role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      signIn: handleSignIn, 
      signOut, 
      loading,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
