
import { supabase } from '@/lib/supabase';

export const ADMIN_CREDENTIALS = {
  email: 'diggs844037@yahoo.com',
  password: '1Lilwayne!!'
};

export async function createAdminUser() {
  try {
    console.log('Creating admin user account...');
    
    // First, try to sign in to see if user already exists
    const { data: existingSignIn, error: existingSignInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    if (!existingSignInError && existingSignIn.user) {
      console.log('Admin user already exists and can sign in');
      // User exists and credentials work, ensure profile exists
      await ensureAdminProfileSafe(existingSignIn.user.id);
      // Sign out after verification
      await supabase.auth.signOut();
      return { success: true, message: 'Admin user verified and profile updated' };
    }

    // If sign in failed, try to create new user
    console.log('Attempting to create new admin user...');
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
      console.error('Sign up error:', signUpError);
      
      // If user already exists but password is wrong
      if (signUpError.message.includes('already registered')) {
        return { 
          success: false, 
          message: 'Admin user exists but password verification failed. Please check the password or contact support.' 
        };
      }
      
      throw signUpError;
    }

    // Check if user was created successfully
    if (!signUpData.user) {
      return { success: false, message: 'Failed to create admin user - no user data returned' };
    }

    console.log('New admin user created:', signUpData.user.id);
    
    // Wait longer for the auth system to fully process the new user
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify the user exists in auth.users before creating profile
    const { data: verifyUser, error: verifyError } = await supabase.auth.getUser();
    
    if (verifyError || !verifyUser.user) {
      console.error('User verification failed after creation:', verifyError);
      return { 
        success: false, 
        message: 'User was created but verification failed. Please try signing in manually.' 
      };
    }
    
    // Create admin profile using the safe function
    await ensureAdminProfileSafe(signUpData.user.id);
    
    // Sign out the newly created user
    await supabase.auth.signOut();
    
    return { success: true, message: 'Admin user created successfully' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
}

async function ensureAdminProfileSafe(userId: string) {
  try {
    console.log('Creating admin profile using safe function for user ID:', userId);
    
    // Use the security definer function that bypasses RLS
    const { error } = await supabase.rpc('create_admin_profile_safe', {
      admin_user_id: userId,
      admin_email: ADMIN_CREDENTIALS.email
    });

    if (error) {
      console.error('Error calling create_admin_profile_safe:', error);
      throw error;
    }

    console.log('Admin profile created/updated successfully using safe function');
  } catch (error) {
    console.error('Failed to ensure admin profile:', error);
    throw error;
  }
}
