
import { useState } from 'react';
import { supabase, UserData } from '@/lib/supabase';
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
      
      // Use direct query since RLS policies are now properly configured
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[UserProfile] Error fetching user data:', error);
        
        // Check if this is an admin user by email and handle accordingly
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && AuthService.isAdminEmail(userData.user.email)) {
          console.log('[UserProfile] Admin user detected by email. Creating admin profile.');
          
          // Try to create admin profile
          try {
            await AuthService.ensureAdminProfile(userId, userData.user.email);
            
            // Try to fetch again after creation
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            if (!retryError && retryData) {
              setUserData(retryData);
              setIsSuperAdmin(true);
              return retryData;
            }
          } catch (createError) {
            console.error('[UserProfile] Error creating admin profile:', createError);
          }
          
          // Fallback: Create temporary admin data object
          const adminData: UserData = {
            id: userId,
            email: userData.user.email,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          return adminData;
        }
        
        return null;
      }

      if (!data) {
        console.log('[UserProfile] No user profile found for ID:', userId);
        
        // Check if this is an admin email
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('[UserProfile] Error fetching user details:', userError);
          return null;
        }
        
        const isAdmin = AuthService.isAdminEmail(userData?.user?.email);
        
        if (isAdmin && userData?.user) {
          console.log('[UserProfile] Admin user without profile. Creating admin profile.');
          
          try {
            await AuthService.ensureAdminProfile(userId, userData.user.email);
            
            // Try to fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            if (newProfile) {
              setUserData(newProfile);
              setIsSuperAdmin(true);
              return newProfile;
            }
          } catch (createError) {
            console.warn('[UserProfile] Admin profile creation failed:', createError);
          }
          
          // Fallback to temporary admin data
          const adminData: UserData = {
            id: userId,
            email: userData.user.email,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          return adminData;
        } 
        
        // For non-admin users without profiles, create default profile
        if (userData?.user) {
          const defaultUserData: UserData = {
            id: userId,
            email: userData.user.email || '',
            role: (userData.user.user_metadata?.role as UserData['role']) || 'customer',
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          };
          setUserData(defaultUserData);
          return defaultUserData;
        }
        
        setUserData(null);
        return null;
      } else {
        console.log('[UserProfile] User data fetched:', {
          id: data.id,
          email: data.email,
          role: data.role
        });
        
        setUserData(data);
        
        // Check if user is admin
        const isAdmin = AuthService.isAdminEmail(data.email) || data.role === 'admin';
        setIsSuperAdmin(isAdmin);
        
        return data;
      }
    } catch (err) {
      console.error('[UserProfile] Unexpected error during fetchUserData:', err);
      
      // Fallback for admin users during errors
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && AuthService.isAdminEmail(userData.user.email)) {
          console.log('[UserProfile] Admin user detected during error recovery.');
          const adminData: UserData = {
            id: userId,
            email: userData.user.email,
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
    return AuthService.ensureAdminProfile(userId, isAdmin ? ADMIN_EMAILS[0] : '');
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
