
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserRole, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define protected routes by role
const roleBasedRoutes: Record<UserRole, string[]> = {
  customer: ['/customer'],
  employee: ['/employee'],
  admin: ['/admin']
};

// Define the administrator email
const ADMIN_EMAIL = 'diggs844037@yahoo.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No session');
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      } finally {
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Auth state change listener
  useEffect(() => {
    if (!sessionChecked) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserData(null);
        setIsSuperAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  // Route protection logic
  useEffect(() => {
    if (loading) return;
    
    const currentPath = location.pathname;
    
    // Handle authenticated users
    if (user && userData) {
      // Administrator check
      setIsSuperAdmin(userData.email === ADMIN_EMAIL);
      
      // Check if the user is trying to access a route they don't have permission for
      const isProtectedRoute = Object.entries(roleBasedRoutes).some(
        ([role, routes]) => 
          routes.some(route => currentPath.startsWith(route)) && 
          role !== userData.role
      );
      
      if (isProtectedRoute) {
        console.log('Unauthorized access attempt:', currentPath, 'by user with role:', userData.role);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `You don't have permission to access this section.`,
        });
        
        // Redirect based on user role
        redirectBasedOnRole(userData.role);
      }
    } 
    // Handle unauthenticated users
    else if (!user) {
      // Check if the user is trying to access a protected route when not logged in
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access this page.",
        });
        navigate('/');
      }
    }
  }, [loading, user, userData, location.pathname]);

  async function fetchUserData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user data",
        });
        setUserData(null);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('No user profile found');
        toast({
          variant: "destructive",
          title: "Error", 
          description: "User profile not found",
        });
        setUserData(null);
        setLoading(false);
        return;
      }

      console.log('User data fetched:', data);
      setUserData(data);
      setIsSuperAdmin(data.email === ADMIN_EMAIL);
    } catch (err) {
      console.error('Unexpected error during fetchUserData:', err);
      setUserData(null);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  function redirectBasedOnRole(role: UserRole) {
    switch (role) {
      case 'customer':
        navigate('/customer/dashboard');
        break;
      case 'employee':
        navigate('/employee/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  }

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in as ${role} with email: ${email}`);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('No user returned from sign in');
      }

      console.log('User signed in successfully:', signInData.user.email);
      
      // Fetch user data to verify role
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user role:', userError);
        throw new Error('Failed to fetch user role');
      }

      if (!userData) {
        console.error('No user profile found');
        await signOut();
        throw new Error('User profile not found. Please contact support.');
      }

      if (userData.role !== role) {
        console.error(`Role mismatch: account is ${userData.role}, tried to login as ${role}`);
        await signOut();
        throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${userData.role}.`);
      }

      await fetchUserData(signInData.user.id);

      toast({
        title: "Success",
        description: "Successfully logged in",
      });

      // Redirect based on role
      redirectBasedOnRole(role);
    } catch (error: any) {
      console.error('Sign in process failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
      });
      await signOut();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      setLoading(false);
      setUser(null);
      setUserData(null);
      setIsSuperAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      signIn, 
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
