
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
        console.log('[DIAGNOSTIC] Starting initial session check');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[DIAGNOSTIC] Initial session check result:', {
          hasSession: !!session,
          userEmail: session?.user?.email || 'No user in session'
        });
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[DIAGNOSTIC] User found in session, will fetch profile:', session.user.id);
          const profile = await fetchUserData(session.user.id);
          console.log('[DIAGNOSTIC] Profile fetch result:', {
            profileFound: !!profile,
            profileRole: profile?.role || 'No role',
            isAdminEmail: session.user.email === ADMIN_EMAIL
          });
          
          // Special handling for admin user to ensure their profile exists
          if (!profile && session.user.email === ADMIN_EMAIL) {
            console.log('[DIAGNOSTIC] Creating missing admin profile');
            await createAdminProfile(session.user.id, session.user.email);
            const adminProfile = await fetchUserData(session.user.id);
            console.log('[DIAGNOSTIC] Admin profile created and fetched:', {
              success: !!adminProfile,
              role: adminProfile?.role || 'Creation failed'
            });
          }
        } else {
          console.log('[DIAGNOSTIC] No user in session during initial check');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[DIAGNOSTIC] Error checking session:', error);
        setLoading(false);
      } finally {
        console.log('[DIAGNOSTIC] Session check completed, sessionChecked set to true');
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Special function to ensure admin profile exists
  const createAdminProfile = async (userId: string, email: string) => {
    try {
      console.log('[DIAGNOSTIC] Attempting to create admin profile for:', email);
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          role: 'admin',
          full_name: 'Admin User'
        });
      
      if (error) {
        console.error('[DIAGNOSTIC] Error creating admin profile:', error);
        return false;
      }
      
      console.log('[DIAGNOSTIC] Successfully created admin profile for:', email);
      return true;
    } catch (err) {
      console.error('[DIAGNOSTIC] Failed to create admin profile:', err);
      return false;
    }
  };

  // Auth state change listener
  useEffect(() => {
    if (!sessionChecked) {
      console.log('[DIAGNOSTIC] Skipping auth change listener setup - session not checked yet');
      return;
    }
    
    console.log('[DIAGNOSTIC] Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DIAGNOSTIC] Auth state changed:', {
        event,
        userEmail: session?.user?.email || 'No user',
        hasSession: !!session
      });
      
      if (event === 'SIGNED_OUT') {
        console.log('[DIAGNOSTIC] SIGNED_OUT event received, clearing user state');
        setUser(null);
        setUserData(null);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('[DIAGNOSTIC] Auth state changed with user, setting user state');
        setUser(session.user);
        console.log('[DIAGNOSTIC] Fetching profile after auth state change');
        const profile = await fetchUserData(session.user.id);
        console.log('[DIAGNOSTIC] Profile after auth state change:', {
          profileFound: !!profile,
          profileRole: profile?.role || 'No role',
          isAdminEmail: session.user.email === ADMIN_EMAIL
        });
        
        // Special handling for admin user
        if (!profile && session.user.email === ADMIN_EMAIL) {
          console.log('[DIAGNOSTIC] Creating missing admin profile on auth change');
          await createAdminProfile(session.user.id, session.user.email);
          await fetchUserData(session.user.id);
        }
      } else {
        console.log('[DIAGNOSTIC] No user in session after auth state change');
        setUser(null);
        setUserData(null);
        setIsSuperAdmin(false);
      }
      
      setLoading(false);
    });

    console.log('[DIAGNOSTIC] Auth state change listener setup complete');

    return () => {
      console.log('[DIAGNOSTIC] Unsubscribing from auth state change');
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  // Auth methods
  const signIn = async (email: string, password: string, role: UserData['role']) => {
    try {
      setLoading(true);
      console.log(`[DIAGNOSTIC] Attempting to sign in as ${role} with email: ${email}`);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[DIAGNOSTIC] Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        console.error('[DIAGNOSTIC] No user returned from sign in');
        throw new Error('No user returned from sign in');
      }

      console.log('[DIAGNOSTIC] User signed in successfully:', {
        id: signInData.user.id,
        email: signInData.user.email,
        isAdmin: email === ADMIN_EMAIL
      });
      console.log('[DIAGNOSTIC] Session after sign in:', {
        hasSession: !!signInData.session,
        expiresAt: signInData.session?.expires_at
      });
      
      // Special handling for admin email
      if (email === ADMIN_EMAIL) {
        console.log('[DIAGNOSTIC] Admin user login detected, checking profile');
        const profile = await fetchUserData(signInData.user.id);
        
        if (!profile) {
          console.log('[DIAGNOSTIC] No admin profile found, creating one');
          await createAdminProfile(signInData.user.id, email);
          const adminProfile = await fetchUserData(signInData.user.id);
          console.log('[DIAGNOSTIC] Admin profile creation result:', {
            success: !!adminProfile,
            role: adminProfile?.role || 'Creation failed'
          });
        }
        
        toast({
          title: "Success",
          description: "Admin successfully logged in",
        });
        
        return 'admin';
      }
      
      // Regular profile check for non-admin users
      console.log('[DIAGNOSTIC] Checking user profile in database');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .maybeSingle();
      
      console.log('[DIAGNOSTIC] Profile check result:', {
        found: !!profileData,
        role: profileData?.role || 'No role',
        error: profileError ? true : false
      });
      
      if (profileError) {
        console.error('[DIAGNOSTIC] Error fetching user profile:', profileError);
        // Try to create the profile if it doesn't exist
        console.log('[DIAGNOSTIC] Attempting to create missing profile');
        const created = await fetchUserData(signInData.user.id);
        if (!created) {
          console.error('[DIAGNOSTIC] Failed to create user profile');
          throw new Error('Failed to create user profile. Please contact support.');
        }
        
        // Re-fetch the profile after creation
        console.log('[DIAGNOSTIC] Re-fetching profile after creation');
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle();
          
        console.log('[DIAGNOSTIC] Profile re-fetch result:', {
          found: !!newProfile,
          role: newProfile?.role || 'No role',
          error: newProfileError ? true : false
        });
          
        if (newProfileError || !newProfile) {
          console.error('[DIAGNOSTIC] Failed to verify user profile after creation');
          throw new Error('Failed to verify user profile. Please contact support.');
        }
        
        if (newProfile.role !== role) {
          console.error(`[DIAGNOSTIC] Role mismatch: account is ${newProfile.role}, tried to login as ${role}`);
          await signOut();
          throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${newProfile.role}.`);
        }
      } else if (!profileData) {
        // Profile doesn't exist, create it
        console.log('[DIAGNOSTIC] Profile not found, creating new profile');
        const created = await fetchUserData(signInData.user.id);
        console.log('[DIAGNOSTIC] Profile creation result:', {
          success: !!created,
          role: created?.role || 'Creation failed'
        });
        if (!created) {
          console.error('[DIAGNOSTIC] Failed to create user profile');
          throw new Error('Failed to create user profile. Please contact support.');
        }
      } else if (profileData.role !== role && email !== ADMIN_EMAIL) {
        // Role mismatch (skip for admin email)
        console.error(`[DIAGNOSTIC] Role mismatch: account is ${profileData.role}, tried to login as ${role}`);
        await signOut();
        throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${profileData.role}.`);
      }

      console.log('[DIAGNOSTIC] Final profile fetch after all checks');
      await fetchUserData(signInData.user.id);

      toast({
        title: "Success",
        description: "Successfully logged in",
      });

      return userData?.role;
    } catch (error: any) {
      console.error('[DIAGNOSTIC] Sign in process failed:', error);
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
      console.log('[DIAGNOSTIC] Starting sign out process');
      setLoading(true);
      await supabase.auth.signOut();
      console.log('[DIAGNOSTIC] Supabase auth.signOut() completed');
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error: any) {
      console.error('[DIAGNOSTIC] Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      console.log('[DIAGNOSTIC] Clearing user state after signOut');
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
