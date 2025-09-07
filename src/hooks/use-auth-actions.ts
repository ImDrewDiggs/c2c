
import { useState, useRef } from 'react';
import { supabase, UserData } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from './use-user-profile';
import { useAbortController } from './use-abort-controller';
import { EnhancedAuthService } from '@/services/EnhancedAuthService';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const pendingOperation = useRef<boolean>(false);
  const { toast } = useToast();
  const { fetchUserData, setUserData, setIsSuperAdmin } = useUserProfile();
  const { getController, isMounted } = useAbortController();

  const signIn = async (email: string, password: string, role: UserData['role']) => {
    if (pendingOperation.current) {
      console.log('[AuthActions] Operation already in progress, ignoring duplicate request');
      return role;
    }

    const controller = getController();

    try {
      pendingOperation.current = true;
      setLoading(true);
      console.log(`[AuthActions] Attempting to sign in as ${role} with email: ${email}`);
      
      const result = await EnhancedAuthService.signIn(email, password, role);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      if (!result.user || !isMounted()) {
        return role;
      }

      console.log('[AuthActions] User signed in successfully:', {
        id: result.user.id,
        email: result.user.email,
        role: result.role
      });
      
      // Handle admin users
      if (result.role === 'admin') {
        console.log('[AuthActions] Admin user login detected');
        setIsSuperAdmin(true);
        
        try {
          const profile = await fetchUserData(result.user.id);
          
          if (!profile && isMounted()) {
            console.log('[AuthActions] No admin profile found, will be created automatically');
          }
          
          if (isMounted()) {
            setUserData({
              id: result.user.id,
              email: email,
              role: 'admin',
              full_name: 'Administrator'
            });
          }
        } catch (profileError) {
          console.error('[AuthActions] Error handling admin profile:', profileError);
          if (isMounted()) {
            setUserData({
              id: result.user.id,
              email: email,
              role: 'admin',
              full_name: 'Administrator'
            });
          }
        }
        
        if (isMounted()) {
          toast({
            title: "Success",
            description: "Admin successfully logged in",
          });
        }
        
        return 'admin';
      }
      
      // Handle regular users
      try {
        const profile = await fetchUserData(result.user.id);
        
        if (profile && isMounted()) {
          setUserData(profile as UserData);
        } else if (isMounted()) {
          const defaultUserData: UserData = {
            id: result.user.id,
            email: email,
            role: role,
            full_name: email.split('@')[0]
          };
          setUserData(defaultUserData);
        }
      } catch (profileError) {
        console.error('[AuthActions] Profile error:', profileError);
        if (isMounted()) {
          throw new Error('Error verifying user profile');
        }
      }

      if (isMounted()) {
        toast({
          title: "Success",
          description: "Successfully logged in",
        });
      }

      return result.role;
    } catch (error: any) {
      console.error('[AuthActions] Sign in process failed:', error);
      if (isMounted()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An error occurred during login",
        });
      }
      throw error;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
      setTimeout(() => {
        pendingOperation.current = false;
      }, 1000);
    }
  };

  const signOut = async () => {
    if (pendingOperation.current) {
      return;
    }

    try {
      pendingOperation.current = true;
      console.log('[AuthActions] Starting sign out process');
      setLoading(true);
      
      // Clear user data first to prevent flashing of unauthorized content
      setUserData(null);
      setIsSuperAdmin(false);
      
      const result = await EnhancedAuthService.signOut();
      
      if (!result.success) {
        throw new Error(result.error || 'Sign out failed');
      }
      
      console.log('[AuthActions] Sign out completed');
      
      if (isMounted()) {
        toast({
          title: "Success",
          description: "Successfully logged out",
        });
      }
    } catch (error: any) {
      console.error('[AuthActions] Sign out error:', error);
      if (isMounted()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error signing out",
        });
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
      setTimeout(() => {
        pendingOperation.current = false;
      }, 1000);
    }
  };

  return {
    signIn,
    signOut,
    loading
  };
}
