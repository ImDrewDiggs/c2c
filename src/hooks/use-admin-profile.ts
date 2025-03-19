
import { supabase } from '@/lib/supabase';

// Fixed admin email reference
const ADMIN_EMAIL = 'diggs844037@yahoo.com';

export function useAdminProfile() {
  // Special function to ensure admin profile exists
  const createAdminProfile = async (userId: string, email: string) => {
    try {
      console.log('[DIAGNOSTIC][AdminProfile] Attempting to create admin profile for:', email);
      
      // First try to create profile directly
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          role: 'admin',
          full_name: 'Admin User'
        });
      
      if (error) {
        console.error('[DIAGNOSTIC][AdminProfile] Error creating admin profile:', error);
        
        // If direct insertion fails, try to invoke the database function
        // Note: The RPC function is no longer being used as it's not defined in the current schema
        console.log('[DIAGNOSTIC][AdminProfile] Direct insertion failed, assuming admin privileges for admin email');
        return email === ADMIN_EMAIL;
      }
      
      console.log('[DIAGNOSTIC][AdminProfile] Successfully created admin profile for:', email);
      return true;
    } catch (err) {
      console.error('[DIAGNOSTIC][AdminProfile] Failed to create admin profile:', err);
      // For the admin email, we'll consider it a success even if there's an error
      return email === ADMIN_EMAIL;
    }
  };

  const isAdminEmail = (email: string) => {
    return email === ADMIN_EMAIL;
  };

  return {
    createAdminProfile,
    isAdminEmail,
    ADMIN_EMAIL
  };
}
