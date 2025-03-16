
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useRouteProtection } from '@/hooks/use-route-protection';
import { UserRole } from '@/lib/supabase';

// Define protected routes by role
const roleBasedRoutes: Record<UserRole, string[]> = {
  customer: ['/customer'],
  employee: ['/employee'],
  admin: ['/admin']
};

// Define public routes that should never trigger auth redirection
const publicRoutes = ['/', '/about', '/testimonials', '/services-and-prices', '/subscription', '/faq', '/contact', '/customer/login', '/customer/register', '/employee/login', '/admin/login'];

// Define the administrator email
const ADMIN_EMAIL = 'diggs844037@yahoo.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Use our custom hooks
  const {
    user,
    userData,
    loading,
    isSuperAdmin,
    signIn,
    signOut
  } = useAuthState();

  const { redirectBasedOnRole } = useRouteProtection(
    loading,
    user,
    userData,
    isSuperAdmin,
    { publicRoutes, roleBasedRoutes, adminEmail: ADMIN_EMAIL }
  );

  // Wrap signIn to handle redirection after successful login
  const handleSignIn = async (email: string, password: string, role: UserRole) => {
    await signIn(email, password, role);
    
    // Special handling for admin email - always redirect to admin dashboard
    if (email === ADMIN_EMAIL) {
      console.log('Admin login detected, redirecting to admin dashboard');
      navigate('/admin/dashboard');
      return;
    }
    
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
