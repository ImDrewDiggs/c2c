
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserData, UserRole } from '@/lib/supabase';
import { AuthService } from '@/services/AuthService';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from '@/types/auth';

// Define routes by role
const roleBasedRoutes: Record<UserRole, string[]> = {
  customer: ['/customer'],
  employee: ['/employee'],
  admin: ['/admin']
};

// Define public routes
const publicRoutes = ['/', '/about', '/testimonials', '/services-and-prices', '/subscription', '/faq', '/contact', '/customer/login', '/customer/register', '/employee/login', '/admin/login'];

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider component
 * Provides authentication state and methods to the application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  
  // Check for session and set up auth state listener
  useEffect(() => {
    let mounted = true;
    
    console.log('[AuthContext] Setting up auth state change listener');
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !currentSession) {
          setUser(null);
          setSession(null);
          setUserData(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }
        
        // Update the basic auth state
        setUser(currentSession.user);
        setSession(currentSession);
        
        // Defer additional operations
        setTimeout(async () => {
          // Only fetch additional data if still mounted
          if (!mounted) return;
          
          // Now fetch the user profile
          try {
            const { profile } = await AuthService.fetchUserProfile(currentSession.user.id);
            if (profile) {
              setUserData(profile);
              const isAdminUser = profile.role === 'admin' || 
                                  AuthService.isAdminEmail(currentSession.user.email);
              setIsAdmin(isAdminUser);
              // Check for admin email directly instead of role comparison for super admin
              const isSuperAdminUser = AuthService.isAdminEmail(currentSession.user.email);
              setIsSuperAdmin(isSuperAdminUser);
            }
          } catch (err) {
            console.error('[AuthContext] Error fetching user profile:', err);
          } finally {
            setLoading(false);
          }
        }, 0);
      }
    );
    
    // Then check for existing session
    AuthService.getSession().then(({ user: sessionUser, session: currentSession }) => {
      if (!mounted) return;
      
      if (sessionUser && currentSession) {
        setUser(sessionUser);
        setSession(currentSession);
        
        // Fetch user profile in background
        AuthService.fetchUserProfile(sessionUser.id)
          .then(({ profile }) => {
            if (mounted && profile) {
              setUserData(profile);
              const isAdminUser = profile.role === 'admin' || 
                                  AuthService.isAdminEmail(sessionUser.email);
              setIsAdmin(isAdminUser);
              // Check for admin email directly instead of role comparison for super admin
              const isSuperAdminUser = AuthService.isAdminEmail(sessionUser.email);
              setIsSuperAdmin(isSuperAdminUser);
            }
          })
          .catch(err => {
            console.error('[AuthContext] Error fetching initial user profile:', err);
          })
          .finally(() => {
            if (mounted) {
              setLoading(false);
              setInitialCheckDone(true);
            }
          });
      } else {
        setLoading(false);
        setInitialCheckDone(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle route protection
  useEffect(() => {
    if (loading || !initialCheckDone) return;
    
    const currentPath = location.pathname;
    
    // Skip protection for public routes
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (isPublicRoute) return;
    
    // Handle authenticated users
    if (user) {
      // Special bypass for admin
      if (isAdmin && currentPath.startsWith('/admin')) {
        return;
      }
      
      // Check for specific role paths
      const isCustomerRoute = currentPath.startsWith('/customer');
      const isEmployeeRoute = currentPath.startsWith('/employee');
      const isAdminRoute = currentPath.startsWith('/admin');
      
      // Only allow access if the role matches or user is admin
      if (isCustomerRoute && (userData?.role === 'customer' || isAdmin)) {
        return;
      }
      
      if (isEmployeeRoute && (userData?.role === 'employee' || isAdmin)) {
        return;
      }
      
      if (isAdminRoute && isAdmin) {
        return;
      }
      
      // Unauthorized access attempt
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area",
      });
      
      // Redirect to appropriate dashboard
      if (userData?.role === 'customer') {
        navigate('/customer/dashboard', { replace: true });
      } else if (userData?.role === 'employee') {
        navigate('/employee/dashboard', { replace: true });
      } else if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      // Handle unauthenticated users trying to access protected routes
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access this page.",
        });
        
        // Direct to appropriate login page
        if (currentPath.startsWith('/admin')) {
          navigate('/admin/login', { replace: true });
        } else if (currentPath.startsWith('/employee')) {
          navigate('/employee/login', { replace: true });
        } else {
          navigate('/customer/login', { replace: true });
        }
      }
    }
  }, [loading, initialCheckDone, user, userData, isAdmin, location.pathname, navigate, toast]);
  
  /**
   * Sign in function
   */
  const signIn = async (email: string, password: string, role: UserRole): Promise<string> => {
    setLoading(true);
    try {
      const { user: authUser, session: authSession, role: resultRole, error } = 
        await AuthService.signIn(email, password, role);
      
      if (error) throw error;
      if (!authUser || !authSession) throw new Error('Authentication failed');
      
      // Special handling for admin
      if (AuthService.isAdminEmail(email) || resultRole === 'admin') {
        setIsAdmin(true);
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 100);
        return 'admin';
      }
      
      // Redirect based on role
      setTimeout(() => {
        if (resultRole === 'customer') {
          navigate('/customer/dashboard', { replace: true });
        } else if (resultRole === 'employee') {
          navigate('/employee/dashboard', { replace: true });
        }
      }, 100);
      
      return resultRole;
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred during login"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Sign out function
   */
  const signOut = async () => {
    setLoading(true);
    try {
      // Clear user data first
      setUserData(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      
      const { error } = await AuthService.signOut();
      if (error) throw error;
      
      navigate('/', { replace: true });
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error: any) {
      console.error('[AuthContext] Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Refresh user data
   */
  const refreshUserData = async () => {
    if (!user) return null;
    
    try {
      const { profile } = await AuthService.fetchUserProfile(user.id);
      if (profile) {
        setUserData(profile);
        const isAdminUser = profile.role === 'admin' || AuthService.isAdminEmail(user.email);
        setIsAdmin(isAdminUser);
        // Check for admin email directly for super admin status
        const isSuperAdminUser = AuthService.isAdminEmail(user.email);
        setIsSuperAdmin(isSuperAdminUser);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('[AuthContext] Error refreshing user data:', err);
      return null;
    }
  };
  
  // Create a stable context value
  const authContextValue = useMemo<AuthContextType>(() => ({
    user, 
    session,
    userData, 
    loading,
    isAdmin,
    isSuperAdmin,
    signIn,
    signOut,
    refreshUserData,
    ADMIN_EMAIL: AuthService.ADMIN_EMAIL
  }), [user, session, userData, loading, isAdmin, isSuperAdmin]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook for accessing the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
