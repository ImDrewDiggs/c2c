
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './use-user-profile';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const { toast } = useToast();

  const {
    userData,
    setUserData,
    isSuperAdmin,
    setIsSuperAdmin,
    fetchUserData,
    ADMIN_EMAIL
  } = useUserProfile();

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No session');
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchUserData(session.user.id);
          // Special handling for admin user to ensure their profile exists
          if (!profile && session.user.email === ADMIN_EMAIL) {
            console.log('Creating missing admin profile');
            await createAdminProfile(session.user.id, session.user.email);
            await fetchUserData(session.user.id);
          }
        } 
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      } finally {
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Special function to ensure admin profile exists
  const createAdminProfile = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          role: 'admin',
          full_name: 'Admin User'
        });
      
      if (error) {
        console.error('Error creating admin profile:', error);
        return false;
      }
      
      console.log('Created admin profile for:', email);
      return true;
    } catch (err) {
      console.error('Failed to create admin profile:', err);
      return false;
    }
  };

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
        const profile = await fetchUserData(session.user.id);
        
        // Special handling for admin user
        if (!profile && session.user.email === ADMIN_EMAIL) {
          console.log('Creating missing admin profile on auth change');
          await createAdminProfile(session.user.id, session.user.email);
          await fetchUserData(session.user.id);
        }
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

  // Auth methods
  const signIn = async (email: string, password: string, role: UserData['role']) => {
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
      
      // Special handling for admin email
      if (email === ADMIN_EMAIL) {
        console.log('Admin user login detected');
        const profile = await fetchUserData(signInData.user.id);
        
        if (!profile) {
          console.log('No admin profile found, creating one');
          await createAdminProfile(signInData.user.id, email);
          await fetchUserData(signInData.user.id);
        }
        
        toast({
          title: "Success",
          description: "Admin successfully logged in",
        });
        
        return 'admin';
      }
      
      // Regular profile check for non-admin users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Try to create the profile if it doesn't exist
        const created = await fetchUserData(signInData.user.id);
        if (!created) {
          throw new Error('Failed to create user profile. Please contact support.');
        }
        
        // Re-fetch the profile after creation
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle();
          
        if (newProfileError || !newProfile) {
          throw new Error('Failed to verify user profile. Please contact support.');
        }
        
        if (newProfile.role !== role) {
          console.error(`Role mismatch: account is ${newProfile.role}, tried to login as ${role}`);
          await signOut();
          throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${newProfile.role}.`);
        }
      } else if (!profileData) {
        // Profile doesn't exist, create it
        const created = await fetchUserData(signInData.user.id);
        if (!created) {
          throw new Error('Failed to create user profile. Please contact support.');
        }
      } else if (profileData.role !== role && email !== ADMIN_EMAIL) {
        // Role mismatch (skip for admin email)
        console.error(`Role mismatch: account is ${profileData.role}, tried to login as ${role}`);
        await signOut();
        throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${profileData.role}.`);
      }

      await fetchUserData(signInData.user.id);

      toast({
        title: "Success",
        description: "Successfully logged in",
      });

      return userData?.role;
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

  return {
    user,
    userData,
    loading,
    isSuperAdmin,
    signIn,
    signOut
  };
}
