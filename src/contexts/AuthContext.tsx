
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserRole, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserData(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user data",
        });
        setUserData(null);
        return;
      }

      setUserData(data);
    } catch (err) {
      console.error('Unexpected error during fetchUserData:', err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (signInData.user) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user role:', userError);
          throw new Error('Failed to fetch user role');
        }

        if (!userData || userData.role !== role) {
          await signOut();
          throw new Error('Invalid role for this login portal');
        }

        await fetchUserData(signInData.user.id);

        toast({
          title: "Success",
          description: "Successfully logged in",
        });

        // Redirect based on role
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
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during login",
      });
      throw error; // Re-throw to be handled by the component
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, signIn, signOut, loading }}>
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
