
import { useState } from 'react';
import { supabase, UserData } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';

export function useUserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  
  // Use the static property from AuthService
  const ADMIN_EMAILS = AuthService.ADMIN_EMAILS;

  async function fetchUserData(userId: string) {
    try {
      console.log('[UserProfile] Fetching user data for ID:', userId);
      
      // Get user from auth first to check email
      const { data: authUser } = await supabase.auth.getUser();
      const userEmail = authUser?.user?.email;
      
      // Check if this is an admin email first
      const isAdminByEmail = AuthService.isAdminEmail(userEmail);
      
      if (isAdminByEmail) {
        console.log('[UserProfile] Admin user detected by email, setting admin data');
        const adminData: UserData = {
          id: userId,
          email: userEmail,
          role: 'admin',
          full_name: 'Administrator',
        };
        setUserData(adminData);
        setIsSuperAdmin(true);
        return adminData;
      }
      
      // Fetch profile data (role column no longer exists)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, address, job_title, status, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[UserProfile] Error fetching user data:', error);
        
        // Create default user data if profile fetch fails
        if (userEmail) {
          const defaultUserData: UserData = {
            id: userId,
            email: userEmail,
            role: 'customer',
            full_name: userEmail.split('@')[0],
          };
          setUserData(defaultUserData);
          return defaultUserData;
        }
        
        return null;
      }

      if (!data) {
        console.log('[UserProfile] No user profile found for ID:', userId);
        
        // Create default profile for non-admin users
        if (userEmail) {
          const defaultUserData: UserData = {
            id: userId,
            email: userEmail,
            role: 'customer',
            full_name: userEmail.split('@')[0],
          };
          setUserData(defaultUserData);
          return defaultUserData;
        }
        
        setUserData(null);
        return null;
      } else {
        console.log('[UserProfile] User data fetched:', {
          id: data.id,
          email: data.email
        });
        
        // SECURITY: Role is now fetched from user_roles table via RBAC
        // No longer using profiles.role column
        setUserData(data as UserData);
        setIsSuperAdmin(false); // Will be set by permission manager
        
        return data;
      }
    } catch (err) {
      console.error('[UserProfile] Unexpected error during fetchUserData:', err);
      
      // Fallback for admin users during errors
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user?.email && AuthService.isAdminEmail(authUser.user.email)) {
          console.log('[UserProfile] Admin user detected during error recovery.');
          const adminData: UserData = {
            id: userId,
            email: authUser.user.email,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          return adminData;
        }
      } catch (innerErr) {
        console.error('[UserProfile] Error during recovery check:', innerErr);
      }
      
      setUserData(null);
      setIsSuperAdmin(false);
      return null;
    }
  }

  // Helper function to create missing profile for known users
  async function createMissingUserProfile(userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email || '';
      
      if (isAdmin || AuthService.isAdminEmail(email)) {
        return AuthService.ensureAdminProfile(userId, email);
      }
      
      return false;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  }

  return {
    userData,
    setUserData,
    isSuperAdmin,
    setIsSuperAdmin,
    fetchUserData,
    createMissingUserProfile,
    ADMIN_EMAILS
  };
}
