
import { supabase } from '@/integrations/supabase/client';

export const ADMIN_CREDENTIALS = [
  {
    email: 'diggs844037@yahoo.com',
    password: '1Lilwayne!!'
  },
  {
    email: 'drewdiggs844037@gmail.com',
    password: '1Lilwayne!!'
  }
];

export async function createAdminUser(adminEmail?: string) {
  try {
    // Use provided email or default to first admin
    const targetAdmin = adminEmail 
      ? ADMIN_CREDENTIALS.find(admin => admin.email === adminEmail)
      : ADMIN_CREDENTIALS[0];
    
    if (!targetAdmin) {
      return { success: false, message: 'Invalid admin email provided' };
    }

    console.log('Creating admin user account for:', targetAdmin.email);
    
    // First, try to sign in to see if user already exists and can authenticate
    const { data: existingSignIn, error: existingSignInError } = await supabase.auth.signInWithPassword({
      email: targetAdmin.email,
      password: targetAdmin.password,
    });

    if (!existingSignInError && existingSignIn.user) {
      console.log('Admin user already exists and can sign in');
      // User exists and credentials work, ensure profile exists
      await ensureAdminProfileSafe(existingSignIn.user.id, targetAdmin.email);
      // Sign out after verification
      await supabase.auth.signOut();
      return { success: true, message: 'Admin user verified and profile updated. You can now sign in.' };
    }

    // If sign in failed, try to create new user
    console.log('Attempting to create new admin user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: targetAdmin.email,
      password: targetAdmin.password,
      options: {
        data: {
          full_name: 'Administrator'
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      
      // If user already exists but password is wrong or user is unconfirmed
      if (signUpError.message.includes('already registered')) {
        return { 
          success: false, 
          message: 'Admin user exists but may need email confirmation. Please check your email and confirm the account, or contact support if the password is incorrect.' 
        };
      }
      
      throw signUpError;
    }

    // Check if user was created successfully
    if (!signUpData.user) {
      return { success: false, message: 'Failed to create admin user - no user data returned' };
    }

    console.log('New admin user created:', signUpData.user.id);
    
    // Check if email confirmation is required
    if (!signUpData.session) {
      console.log('Email confirmation required for new user');
      return { 
        success: true, 
        message: 'Admin user created but requires email confirmation. Please check your email and click the confirmation link, then try signing in.' 
      };
    }

    // If we have a session, the user is confirmed and ready to use
    try {
      await ensureAdminProfileSafe(signUpData.user.id, targetAdmin.email);
      console.log('Admin profile created successfully');
    } catch (profileError) {
      console.warn('Profile creation failed, but user was created:', profileError);
      // Continue anyway - the profile can be created on first login
    }
    
    // Sign out the newly created user
    await supabase.auth.signOut();
    
    return { success: true, message: 'Admin user created successfully. You can now sign in with the admin credentials.' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
}

async function ensureAdminProfileSafe(userId: string, email: string) {
  try {
    console.log('Creating admin profile using safe function for user ID:', userId);
    
    // Use the security definer function that bypasses RLS
    const { error } = await supabase.rpc('create_admin_profile_safe', {
      admin_user_id: userId,
      admin_email: email
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
