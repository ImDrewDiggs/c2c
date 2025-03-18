
import { supabase } from '@/lib/supabase';

// Fixed admin email reference
const ADMIN_EMAIL = 'diggs844037@yahoo.com';

export function useAdminProfile() {
  // Special function to ensure admin profile exists
  const createAdminProfile = async (userId: string, email: string) => {
    try {
      console.log('[DIAGNOSTIC][AdminProfile] Attempting to create admin profile for:', email);
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
        return false;
      }
      
      console.log('[DIAGNOSTIC][AdminProfile] Successfully created admin profile for:', email);
      return true;
    } catch (err) {
      console.error('[DIAGNOSTIC][AdminProfile] Failed to create admin profile:', err);
      return false;
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
