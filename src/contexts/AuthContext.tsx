
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useRouteProtection } from '@/hooks/use-route-protection';
import { UserRole } from '@/lib/supabase';
import { AuthService } from '@/services/AuthService';

// Define protected routes by role
const roleBasedRoutes: Record<UserRole, string[]> = {
  customer: ['/customer'],
  employee: ['/employee'],
  admin: ['/admin']
};

// Define public routes that should never trigger auth redirection
const publicRoutes = ['/', '/about', '/testimonials', '/services-and-prices', '/subscription', '/faq', '/contact', '/customer/login', '/customer/register', '/employee/login', '/admin/login'];

// Create context with defaultValue
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  console.log('[AuthContext] AuthProvider initialized, path:', location.pathname);

  // Use our custom hooks
  const {
    user,
    userData,
    loading,
    isSuperAdmin,
    signIn,
    signOut,
    ADMIN_EMAIL
  } = useAuthState();

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('[AuthContext] AuthProvider useEffect - auth state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasUserData: !!userData,
      userRole: userData?.role,
      isSuperAdmin,
      isLoading: loading,
      initialCheckDone
    });
    
    if (!loading && !initialCheckDone) {
      setInitialCheckDone(true);
    }
  }, [user, userData, isSuperAdmin, loading, initialCheckDone]);

  // Wait to initialize route protection until after initial auth check to prevent redirect loops
  const { redirectBasedOnRole } = useRouteProtection(
    loading,
    user,
    userData,
    isSuperAdmin,
    { publicRoutes, roleBasedRoutes, adminEmail: ADMIN_EMAIL }
  );

  // Wrap signIn to handle redirection after successful login
  const handleSignIn = async (email: string, password: string, role: UserRole): Promise<string> => {
    console.log('[AuthContext] handleSignIn called for email:', email, 'role:', role);
    try {
      await signIn(email, password, role);
      
      // Special handling for admin email - always redirect to admin dashboard
      if (email === ADMIN_EMAIL) {
        console.log('[AuthContext] Admin login detected, redirecting to admin dashboard');
        navigate('/admin/dashboard');
        return 'admin';
      }
      
      console.log('[AuthContext] Redirecting based on role:', role);
      redirectBasedOnRole(role);
      return role;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return '';
    }
  };

  // Create a stable context value object to prevent unnecessary re-renders
  const authContextValue = useMemo<AuthContextType>(() => ({
    user, 
    userData, 
    signIn: handleSignIn, 
    signOut, 
    loading,
    isSuperAdmin
  }), [user, userData, signIn, signOut, loading, isSuperAdmin, handleSignIn]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
