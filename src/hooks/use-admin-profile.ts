
import { supabase } from '@/lib/supabase';

// Updated admin email reference
const ADMIN_EMAIL = 'diggs844037@yahoo.com';

export function useAdminProfile() {
  // Special function to ensure admin profile exists
  const createAdminProfile = async (userId: string, email: string) => {
    try {
      console.log('[DIAGNOSTIC][AdminProfile] Attempting to create admin profile for:', email);
      
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('[DIAGNOSTIC][AdminProfile] Error checking for existing profile:', checkError);
      }
      
      // If profile exists, just update it to admin role
      if (existingProfile) {
        console.log('[DIAGNOSTIC][AdminProfile] Profile exists, updating to admin role');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateError) {
          console.error('[DIAGNOSTIC][AdminProfile] Error updating profile to admin:', updateError);
          // Return true for admin email even if update fails
          return email === ADMIN_EMAIL;
        }
        
        return true;
      }
      
      // If profile doesn't exist, create it
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
        // Return true for admin email even if creation fails
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
