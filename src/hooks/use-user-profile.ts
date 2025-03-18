
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
        
        // For admin user - auto-create profile with admin role
        if (isAdmin) {
          console.log('[DIAGNOSTIC][UserProfile] Creating missing admin profile');
          if (await createMissingUserProfile(userId, true)) {
            // Retry fetching after creating
            console.log('[DIAGNOSTIC][UserProfile] Admin profile created, refetching');
            return await fetchUserData(userId);
          }
        } 
        // For other users - create normal profile
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
          } else {
            console.log('[DIAGNOSTIC][UserProfile] Successfully updated to admin role');
          }
            
          // Refetch to get updated data
          console.log('[DIAGNOSTIC][UserProfile] Updated role, refetching profile');
          return await fetchUserData(userId);
        }
        
        return data;
      }
    } catch (err) {
      console.error('[DIAGNOSTIC][UserProfile] Unexpected error during fetchUserData:', err);
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
        return false;
      }
      
      console.log('[DIAGNOSTIC][UserProfile] Created missing profile for user:', user.email, 'with role:', role);
      return true;
    } catch (err) {
      console.error('[DIAGNOSTIC][UserProfile] Failed to create missing profile:', err);
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
    ADMIN_EMAIL
  };
}
