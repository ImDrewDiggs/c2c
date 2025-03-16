
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
        console.error('No user profile found');
        // Instead of immediately signing out, create a profile for known user roles
        // For admin user - auto-create profile
        if (userId && await createMissingUserProfile(userId)) {
          // Retry fetching after creating
          return await fetchUserData(userId);
        }
        
        setUserData(null);
        return null;
      } else {
        console.log('User data fetched:', data);
        setUserData(data);
        setIsSuperAdmin(data.email === ADMIN_EMAIL);
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
  async function createMissingUserProfile(userId: string): Promise<boolean> {
    try {
      // Get user details from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData.user) {
        console.error('Error fetching user details:', userError);
        return false;
      }
      
      const user = userData.user;
      
      // Determine role based on email (same logic as the trigger)
      const role = user.email === ADMIN_EMAIL ? 'admin' : 'customer';
      
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
      
      console.log('Created missing profile for user:', user.email);
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
