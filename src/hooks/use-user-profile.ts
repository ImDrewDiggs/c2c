
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useUserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  
  // Define the administrator email
  const ADMIN_EMAIL = 'diggs844037@yahoo.com';

  async function fetchUserData(userId: string) {
    try {
      console.log('[DIAGNOSTIC][UserProfile] Fetching user data for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[DIAGNOSTIC][UserProfile] Error fetching user data:', error);
        setUserData(null);
        
        // Check if this is the admin user and immediately set appropriate state
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email === ADMIN_EMAIL) {
          console.log('[DIAGNOSTIC][UserProfile] Admin user detected by email. Setting admin privileges regardless of profile.');
          // Create temporary admin data object
          const adminData: UserData = {
            id: userId,
            email: ADMIN_EMAIL,
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
        console.log('[DIAGNOSTIC][UserProfile] No user profile found for ID:', userId);
        
        // Check if this is the admin email by getting auth user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('[DIAGNOSTIC][UserProfile] Error fetching user details:', userError);
          return null;
        }
        
        console.log('[DIAGNOSTIC][UserProfile] Auth user data:', {
          id: userData?.user?.id,
          email: userData?.user?.email,
          metadata: userData?.user?.user_metadata
        });
        
        const isAdmin = userData?.user?.email === ADMIN_EMAIL;
        console.log('[DIAGNOSTIC][UserProfile] Is admin email?', isAdmin);
        
        // For admin user - create temporary admin object even if profile creation fails
        if (isAdmin) {
          console.log('[DIAGNOSTIC][UserProfile] Admin user without profile. Creating temporary admin state.');
          // Create temporary admin data object
          const adminData: UserData = {
            id: userId,
            email: ADMIN_EMAIL,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          
          // Try to create the profile in the background
          console.log('[DIAGNOSTIC][UserProfile] Attempting to create admin profile in background');
          createMissingUserProfile(userId, true).catch(err => {
            console.warn('[DIAGNOSTIC][UserProfile] Admin profile creation failed, but continuing with temporary profile:', err.message);
          });
          
          return adminData;
        } 
        // For other users - attempt to create profile
        else if (await createMissingUserProfile(userId, false)) {
          // Retry fetching after creating
          console.log('[DIAGNOSTIC][UserProfile] Regular profile created, refetching');
          return await fetchUserData(userId);
        }
        
        setUserData(null);
        return null;
      } else {
        console.log('[DIAGNOSTIC][UserProfile] User data fetched:', {
          id: data.id,
          email: data.email,
          role: data.role
        });
        setUserData(data);
        // Ensure admin is properly flagged
        const isAdmin = data.email === ADMIN_EMAIL || data.role === 'admin';
        console.log('[DIAGNOSTIC][UserProfile] Setting isSuperAdmin to:', isAdmin);
        setIsSuperAdmin(isAdmin);
        
        // If this is admin email but role isn't set as admin, update it
        if (data.email === ADMIN_EMAIL && data.role !== 'admin') {
          console.log('[DIAGNOSTIC][UserProfile] Updating user to admin role');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
            
          if (updateError) {
            console.error('[DIAGNOSTIC][UserProfile] Error updating to admin role:', updateError);
            // Even if update fails, force set admin role in local state
            data.role = 'admin';
            setUserData({...data});
          } else {
            console.log('[DIAGNOSTIC][UserProfile] Successfully updated to admin role');
          }
        }
        
        return data;
      }
    } catch (err) {
      console.error('[DIAGNOSTIC][UserProfile] Unexpected error during fetchUserData:', err);
      
      // Check if this is the admin user even if there's an error
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email === ADMIN_EMAIL) {
          console.log('[DIAGNOSTIC][UserProfile] Admin user detected during error recovery. Setting admin privileges.');
          // Create temporary admin data
          const adminData: UserData = {
            id: userId,
            email: ADMIN_EMAIL,
            role: 'admin',
            full_name: 'Administrator',
          };
          setUserData(adminData);
          setIsSuperAdmin(true);
          return adminData;
        }
      } catch (innerErr) {
        console.error('[DIAGNOSTIC][UserProfile] Error during admin recovery check:', innerErr);
      }
      
      setUserData(null);
      setIsSuperAdmin(false);
      return null;
    }
  }

  // Helper function to create missing profile for known users
  async function createMissingUserProfile(userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
      console.log('[DIAGNOSTIC][UserProfile] Attempting to create missing profile for user ID:', userId, 'isAdmin:', isAdmin);
      // Get user details from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('[DIAGNOSTIC][UserProfile] Error fetching user details:', userError);
        return false;
      }
      
      const user = userData.user;
      console.log('[DIAGNOSTIC][UserProfile] Auth user data for profile creation:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
      
      // For admin, create profile even without going through Supabase
      if (isAdmin || user.email === ADMIN_EMAIL) {
        console.log('[DIAGNOSTIC][UserProfile] Detected admin during profile creation');
        
        // Set admin state regardless of DB creation success
        const adminData: UserData = {
          id: userId,
          email: ADMIN_EMAIL,
          role: 'admin',
          full_name: 'Administrator',
        };
        setUserData(adminData);
        setIsSuperAdmin(true);
      }
      
      // Determine role based on email or passed flag
      const role = isAdmin || user.email === ADMIN_EMAIL ? 'admin' : 'customer';
      console.log('[DIAGNOSTIC][UserProfile] Setting user role to:', role);
      
      // Create the missing profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          role: role,
          full_name: user.user_metadata?.full_name || user.email
        });
      
      if (insertError) {
        console.error('[DIAGNOSTIC][UserProfile] Error creating user profile:', insertError);
        // For admin, return true even if the DB operation failed
        return user.email === ADMIN_EMAIL;
      }
      
      console.log('[DIAGNOSTIC][UserProfile] Created missing profile for user:', user.email, 'with role:', role);
      return true;
    } catch (err) {
      console.error('[DIAGNOSTIC][UserProfile] Failed to create missing profile:', err);
      // For admin, return true even if the operation failed
      try {
        const { data: userData } = await supabase.auth.getUser();
        return userData?.user?.email === ADMIN_EMAIL;
      } catch {
        return false;
      }
    }
  }

  return {
    userData,
    setUserData,
    isSuperAdmin,
    setIsSuperAdmin,
    fetchUserData,
    createMissingUserProfile,
    ADMIN_EMAIL
  };
}
