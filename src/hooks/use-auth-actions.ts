
import { useState } from 'react';
import { supabase, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './use-user-profile';
import { useAdminProfile } from './use-admin-profile';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { fetchUserData, setUserData, setIsSuperAdmin } = useUserProfile();
  const { createAdminProfile, isAdminEmail } = useAdminProfile();

  const signIn = async (email: string, password: string, role: UserData['role']) => {
    try {
      setLoading(true);
      console.log(`[DIAGNOSTIC][AuthActions] Attempting to sign in as ${role} with email: ${email}`);
      
      // Special case for admin email - bypass role checking
      const isAdmin = isAdminEmail(email);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[DIAGNOSTIC][AuthActions] Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        console.error('[DIAGNOSTIC][AuthActions] No user returned from sign in');
        throw new Error('No user returned from sign in');
      }

      console.log('[DIAGNOSTIC][AuthActions] User signed in successfully:', {
        id: signInData.user.id,
        email: signInData.user.email,
        isAdmin: isAdminEmail(email)
      });
      console.log('[DIAGNOSTIC][AuthActions] Session after sign in:', {
        hasSession: !!signInData.session,
        expiresAt: signInData.session?.expires_at
      });
      
      // Special handling for admin email
      if (isAdmin) {
        console.log('[DIAGNOSTIC][AuthActions] Admin user login detected, checking profile');
        const profile = await fetchUserData(signInData.user.id);
        
        if (!profile) {
          console.log('[DIAGNOSTIC][AuthActions] No admin profile found, creating one');
          await createAdminProfile(signInData.user.id, email);
          // Even if profile creation fails, set admin status manually
          setIsSuperAdmin(true);
          setUserData({
            id: signInData.user.id,
            email: email,
            role: 'admin',
            full_name: 'Administrator'
          });
          
          console.log('[DIAGNOSTIC][AuthActions] Admin privileges set regardless of profile status');
        }
        
        toast({
          title: "Success",
          description: "Admin successfully logged in",
        });
        
        return 'admin';
      }
      
      // Regular profile check for non-admin users
      console.log('[DIAGNOSTIC][AuthActions] Checking user profile in database');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .maybeSingle();
      
      console.log('[DIAGNOSTIC][AuthActions] Profile check result:', {
        found: !!profileData,
        role: profileData?.role || 'No role',
        error: profileError ? true : false
      });
      
      if (profileError) {
        console.error('[DIAGNOSTIC][AuthActions] Error fetching user profile:', profileError);
        // Try to create the profile if it doesn't exist
        console.log('[DIAGNOSTIC][AuthActions] Attempting to create missing profile');
        const created = await fetchUserData(signInData.user.id);
        if (!created) {
          console.error('[DIAGNOSTIC][AuthActions] Failed to create user profile');
          throw new Error('Failed to create user profile. Please contact support.');
        }
        
        // Re-fetch the profile after creation
        console.log('[DIAGNOSTIC][AuthActions] Re-fetching profile after creation');
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle();
          
        console.log('[DIAGNOSTIC][AuthActions] Profile re-fetch result:', {
          found: !!newProfile,
          role: newProfile?.role || 'No role',
          error: newProfileError ? true : false
        });
          
        if (newProfileError || !newProfile) {
          console.error('[DIAGNOSTIC][AuthActions] Failed to verify user profile after creation');
          throw new Error('Failed to verify user profile. Please contact support.');
        }
        
        if (newProfile.role !== role) {
          console.error(`[DIAGNOSTIC][AuthActions] Role mismatch: account is ${newProfile.role}, tried to login as ${role}`);
          await signOut();
          throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${newProfile.role}.`);
        }
      } else if (!profileData) {
        // Profile doesn't exist, create it
        console.log('[DIAGNOSTIC][AuthActions] Profile not found, creating new profile');
        const created = await fetchUserData(signInData.user.id);
        console.log('[DIAGNOSTIC][AuthActions] Profile creation result:', {
          success: !!created,
          role: created?.role || 'Creation failed'
        });
        if (!created) {
          console.error('[DIAGNOSTIC][AuthActions] Failed to create user profile');
          throw new Error('Failed to create user profile. Please contact support.');
        }
      } else if (profileData.role !== role && !isAdmin) {
        // Role mismatch (skip for admin email)
        console.error(`[DIAGNOSTIC][AuthActions] Role mismatch: account is ${profileData.role}, tried to login as ${role}`);
        await signOut();
        throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${profileData.role}.`);
      }

      console.log('[DIAGNOSTIC][AuthActions] Final profile fetch after all checks');
      await fetchUserData(signInData.user.id);

      toast({
        title: "Success",
        description: "Successfully logged in",
      });

      return profileData?.role;
    } catch (error: any) {
      console.error('[DIAGNOSTIC][AuthActions] Sign in process failed:', error);
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
      console.log('[DIAGNOSTIC][AuthActions] Starting sign out process');
      setLoading(true);
      await supabase.auth.signOut();
      console.log('[DIAGNOSTIC][AuthActions] Supabase auth.signOut() completed');
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error: any) {
      console.error('[DIAGNOSTIC][AuthActions] Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      console.log('[DIAGNOSTIC][AuthActions] Clearing user state after signOut');
      setLoading(false);
      setUserData(null);
      setIsSuperAdmin(false);
    }
  };

  return {
    signIn,
    signOut,
    loading
  };
}
