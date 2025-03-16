
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
        return null;
      }

      if (!data) {
        console.log('No user profile found for ID:', userId);
        
        // Check if this is the admin email by getting auth user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user details:', userError);
          return null;
        }
        
        const isAdmin = userData?.user?.email === ADMIN_EMAIL;
        
        // For admin user - auto-create profile with admin role
        if (isAdmin) {
          console.log('Creating missing admin profile');
          if (await createMissingUserProfile(userId, true)) {
            // Retry fetching after creating
            return await fetchUserData(userId);
          }
        } 
        // For other users - create normal profile
        else if (await createMissingUserProfile(userId, false)) {
          // Retry fetching after creating
          return await fetchUserData(userId);
        }
        
        setUserData(null);
        return null;
      } else {
        console.log('User data fetched:', data);
        setUserData(data);
        // Ensure admin is properly flagged
        const isAdmin = data.email === ADMIN_EMAIL || data.role === 'admin';
        setIsSuperAdmin(isAdmin);
        
        // If this is admin email but role isn't set as admin, update it
        if (data.email === ADMIN_EMAIL && data.role !== 'admin') {
          console.log('Updating user to admin role');
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
            
          // Refetch to get updated data
          return await fetchUserData(userId);
        }
        
        return data;
      }
    } catch (err) {
      console.error('Unexpected error during fetchUserData:', err);
      setUserData(null);
      setIsSuperAdmin(false);
      return null;
    }
  }

  // Helper function to create missing profile for known users
  async function createMissingUserProfile(userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
      // Get user details from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Error fetching user details:', userError);
        return false;
      }
      
      const user = userData.user;
      
      // Determine role based on email or passed flag
      const role = isAdmin || user.email === ADMIN_EMAIL ? 'admin' : 'customer';
      
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
        console.error('Error creating user profile:', insertError);
        return false;
      }
      
      console.log('Created missing profile for user:', user.email, 'with role:', role);
      return true;
    } catch (err) {
      console.error('Failed to create missing profile:', err);
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
