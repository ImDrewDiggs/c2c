
import { supabase } from '@/lib/supabase';

export const ADMIN_CREDENTIALS = {
  email: 'diggs844037@yahoo.com',
  password: '1Lilwayne!!'
};

export async function createAdminUser() {
  try {
    console.log('Creating admin user account...');
    
    // First, try to sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      options: {
        data: {
          full_name: 'Administrator'
        }
      }
    });

    if (signUpError) {
      // If user already exists, try to sign them in to verify they exist
      if (signUpError.message.includes('already registered')) {
        console.log('Admin user already exists, attempting to sign in to verify...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
        });

        if (signInError) {
          // User exists but password might be wrong, so we need to reset
          console.log('Password verification failed, user exists but password may need reset');
          return { 
            success: false, 
            message: 'Admin user exists but password verification failed. You may need to reset the password.' 
          };
        }

        // User exists and can sign in, now ensure profile is admin
        if (signInData.user) {
          await ensureAdminProfile(signInData.user.id);
          // Sign out after verification
          await supabase.auth.signOut();
        }

        return { success: true, message: 'Admin user verified and profile updated' };
      }
      throw signUpError;
    }

    // New user created successfully
    if (signUpData.user) {
      console.log('New admin user created:', signUpData.user.id);
      await ensureAdminProfile(signUpData.user.id);
      
      // Sign out the newly created user so they can sign in properly
      await supabase.auth.signOut();
      
      return { success: true, message: 'Admin user created successfully' };
    }

    return { success: false, message: 'Failed to create admin user' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
}

async function ensureAdminProfile(userId: string) {
  try {
    console.log('Creating admin profile using database function...');
    
    // Use the new database function to create admin profile
    const { error } = await supabase.rpc('create_admin_profile', {
      admin_user_id: userId,
      admin_email: ADMIN_CREDENTIALS.email
    });

    if (error) {
      console.error('Error calling create_admin_profile function:', error);
      throw error;
    }

    console.log('Admin profile created/updated successfully');
  } catch (error) {
    console.error('Failed to ensure admin profile:', error);
    throw error;
  }
}
