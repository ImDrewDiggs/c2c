
import { useState } from 'react';
import { supabase, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './use-user-profile';
import { AuthService } from '@/services/AuthService';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { fetchUserData, setUserData, setIsSuperAdmin } = useUserProfile();

  const signIn = async (email: string, password: string, role: UserData['role']) => {
    try {
      setLoading(true);
      console.log(`[AuthActions] Attempting to sign in as ${role} with email: ${email}`);
      
      // Special case for admin email - bypass role checking
      const isAdmin = AuthService.isAdminEmail(email);
      
      // Clear any existing session first to prevent conflicts
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AuthActions] Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        console.error('[AuthActions] No user returned from sign in');
        throw new Error('No user returned from sign in');
      }

      console.log('[AuthActions] User signed in successfully:', {
        id: signInData.user.id,
        email: signInData.user.email,
        isAdmin: AuthService.isAdminEmail(email || '')
      });
      
      // Special handling for admin email
      if (isAdmin) {
        console.log('[AuthActions] Admin user login detected, checking profile');
        // First, mark as super admin - don't wait for profile fetch to complete
        setIsSuperAdmin(true);
        
        try {
          const profile = await fetchUserData(signInData.user.id);
          
          if (!profile) {
            console.log('[AuthActions] No admin profile found, creating one');
            await AuthService.ensureAdminProfile(signInData.user.id, email);
          }
          
          // Set admin user data
          setUserData({
            id: signInData.user.id,
            email: email,
            role: 'admin',
            full_name: 'Administrator'
          });
        } catch (profileError) {
          console.error('[AuthActions] Error handling admin profile:', profileError);
          // Continue with admin access even if profile handling fails
          setUserData({
            id: signInData.user.id,
            email: email,
            role: 'admin',
            full_name: 'Administrator'
          });
        }
        
        toast({
          title: "Success",
          description: "Admin successfully logged in",
        });
        
        return 'admin';
      }
      
      // For non-admin users, handle profile checking
      console.log('[AuthActions] Creating default user data for non-admin');
      
      // Create a default profile in memory
      const defaultUserData: UserData = {
        id: signInData.user.id,
        email: email,
        role: role,
        full_name: email.split('@')[0]
      };
      
      try {
        // Try to fetch the profile first
        const profile = await fetchUserData(signInData.user.id);
        
        if (profile) {
          console.log('[AuthActions] Found existing profile:', profile);
          
          // Check if the role matches
          if (profile.role !== role && !isAdmin) {
            console.error(`[AuthActions] Role mismatch: account is ${profile.role}, tried to login as ${role}`);
            await signOut();
            throw new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${profile.role}.`);
          }
          
          // Use the existing profile
          setUserData(profile);
        } else {
          console.log('[AuthActions] No profile found, using default profile data');
          setUserData(defaultUserData);
        }
      } catch (profileError) {
        // If there's an error fetching the profile, just use the default one
        console.warn('[AuthActions] Error fetching profile, using default:', profileError);
        setUserData(defaultUserData);
      }

      toast({
        title: "Success",
        description: "Successfully logged in",
      });

      return role;
    } catch (error: any) {
      console.error('[AuthActions] Sign in process failed:', error);
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
      console.log('[AuthActions] Starting sign out process');
      setLoading(true);
      await supabase.auth.signOut();
      console.log('[AuthActions] Supabase auth.signOut() completed');
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error: any) {
      console.error('[AuthActions] Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error signing out",
      });
    } finally {
      console.log('[AuthActions] Clearing user state after signOut');
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
