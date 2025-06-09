
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[UserProfile] Error fetching user data:', error);
        
        // Check if this is an admin user and immediately set appropriate state
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && AuthService.isAdminEmail(userData.user.email)) {
          console.log('[UserProfile] Admin user detected by email. Setting admin privileges regardless of profile.');
          // Create temporary admin data object
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
        
        // For non-admin users, create a default profile in memory
        const { data: authUserData } = await supabase.auth.getUser();
        if (authUserData?.user) {
          console.log('[UserProfile] Creating default user data for non-admin user');
          const defaultData: UserData = {
            id: userId,
            email: authUserData.user.email || '',
            role: (authUserData.user.user_metadata?.role as UserData['role']) || 'customer',
            full_name: authUserData.user.user_metadata?.full_name || authUserData.user.email?.split('@')[0] || 'User',
          };
          setUserData(defaultData);
          return defaultData;
        }
        
        return null;
      }

      if (!data) {
        console.log('[UserProfile] No user profile found for ID:', userId);
        
        // Check if this is an admin email by getting auth user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('[UserProfile] Error fetching user details:', userError);
          return null;
        }
        
        console.log('[UserProfile] Auth user data:', {
          id: userData?.user?.id,
          email: userData?.user?.email,
          metadata: userData?.user?.user_metadata
        });
        
        const isAdmin = AuthService.isAdminEmail(userData?.user?.email);
        console.log('[UserProfile] Is admin email?', isAdmin);
        
        // For admin user - create temporary admin object even if profile creation fails
        if (isAdmin) {
          console.log('[UserProfile] Admin user without profile. Creating temporary admin state.');
          // Create temporary admin data object
          const adminData: UserData = {
            id: userId,
            email: userData?.user?.email || '',
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          
          // Try to create the profile in the background
          console.log('[UserProfile] Attempting to create admin profile in background');
          AuthService.ensureAdminProfile(userId, userData?.user?.email || '').catch(err => {
            console.warn('[UserProfile] Admin profile creation failed, but continuing with temporary profile:', err.message);
          });
          
          return adminData;
        } 
        
        // For non-admin users - create temporary profile
        if (userData?.user) {
          const defaultUserData: UserData = {
            id: userId,
            email: userData.user.email || '',
            role: (userData.user.user_metadata?.role as UserData['role']) || 'customer',
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          };
          setUserData(defaultUserData);
          
          // Try to create the profile in background but don't block on it
          createMissingUserProfile(userId, false).catch(err => {
            console.warn('[UserProfile] User profile creation failed, but continuing with temporary profile:', err.message);
          });
          
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
        // Ensure admin is properly flagged
        const isAdmin = AuthService.isAdminEmail(data.email) || data.role === 'admin';
        console.log('[UserProfile] Setting isSuperAdmin to:', isAdmin);
        setIsSuperAdmin(isAdmin);
        
        // If this is admin email but role isn't set as admin, update it
        if (AuthService.isAdminEmail(data.email) && data.role !== 'admin') {
          console.log('[UserProfile] Updating user to admin role');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
            
          if (updateError) {
            console.error('[UserProfile] Error updating to admin role:', updateError);
            // Even if update fails, force set admin role in local state
            data.role = 'admin';
            setUserData({...data});
          } else {
            console.log('[UserProfile] Successfully updated to admin role');
          }
        }
        
        return data;
      }
    } catch (err) {
      console.error('[UserProfile] Unexpected error during fetchUserData:', err);
      
      // Check if this is an admin user even if there's an error
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email && AuthService.isAdminEmail(userData.user.email)) {
          console.log('[UserProfile] Admin user detected during error recovery. Setting admin privileges.');
          // Create temporary admin data
          const adminData: UserData = {
            id: userId,
            email: userData.user.email,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          return adminData;
        } else if (userData?.user) {
          // For non-admin users, create temporary data
          const defaultData: UserData = {
            id: userId,
            email: userData.user.email || '',
            role: (userData.user.user_metadata?.role as UserData['role']) || 'customer',
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
          };
          setUserData(defaultData);
          return defaultData;
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
