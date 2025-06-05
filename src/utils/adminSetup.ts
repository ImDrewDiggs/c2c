
import { supabase } from '@/lib/supabase';

export const ADMIN_CREDENTIALS = {
  email: 'diggs844037@yahoo.com',
  password: '1Lilwayne!!'
};

export async function createAdminUser() {
  try {
    console.log('Creating admin user account...');
    
    // First, check if user already exists by trying to sign in
    const { data: existingSignIn, error: existingSignInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    if (!existingSignInError && existingSignIn.user) {
      console.log('Admin user already exists and can sign in');
      // User exists and credentials work, ensure profile exists
      await ensureAdminProfile(existingSignIn.user.id);
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

    // New user created successfully
    if (signUpData.user) {
      console.log('New admin user created:', signUpData.user.id);
      
      // Wait a moment for the user to be fully created in the auth system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create admin profile
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
    console.log('Creating admin profile for user ID:', userId);
    
    // First verify the user exists in auth.users by checking current auth state
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.warn('Could not verify user in auth system:', userError);
    }
    
    // Try to create/update the profile directly first
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists, update it to admin
      console.log('Updating existing profile to admin');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          email: ADMIN_CREDENTIALS.email,
          full_name: 'Administrator',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
    } else {
      // Profile doesn't exist, create it
      console.log('Creating new admin profile');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
          full_name: 'Administrator'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
    }

    console.log('Admin profile created/updated successfully');
  } catch (error) {
    console.error('Failed to ensure admin profile:', error);
    throw error;
  }
}
