import { supabase } from '@/integrations/supabase/client';

/**
 * Secure admin user setup without hardcoded credentials
 * This replaces the insecure adminSetup.ts file
 */

export async function createSecureAdminUser(adminEmail: string, adminPassword: string) {
  try {
    console.log('Creating secure admin user for:', adminEmail);
    
    // Validate admin email is approved
    const approvedEmails = ['diggs844037@yahoo.com', 'drewdiggs844037@gmail.com'];
    if (!approvedEmails.includes(adminEmail)) {
      return { success: false, message: 'Email not authorized for admin access' };
    }

    // First, try to sign in to see if user already exists
    const { data: existingSignIn, error: existingSignInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (!existingSignInError && existingSignIn.user) {
      console.log('Admin user already exists and can sign in');
      // Use secure function to create/update profile
      const { data: result, error: profileError } = await supabase.rpc('create_secure_admin_profile', {
        admin_user_id: existingSignIn.user.id,
        admin_email: adminEmail
      });
      
      // Sign out after verification
      await supabase.auth.signOut();
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, message: 'Failed to create admin profile' };
      }
      
      return { success: true, message: 'Admin user verified and profile updated. You can now sign in.' };
    }

    // If sign in failed, try to create new user
    console.log('Attempting to create new admin user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Administrator'
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      
      if (signUpError.message.includes('already registered')) {
        return { 
          success: false, 
          message: 'Admin user exists but may need email confirmation. Please check your email and confirm the account, or verify the password is correct.' 
        };
      }
      
      throw signUpError;
    }

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

    // Use secure function to create admin profile
    try {
      const { data: result, error: profileError } = await supabase.rpc('create_secure_admin_profile', {
        admin_user_id: signUpData.user.id,
        admin_email: adminEmail
      });
      
      if (profileError) throw profileError;
      
      console.log('Admin profile created successfully');
    } catch (profileError) {
      console.warn('Profile creation failed, but user was created:', profileError);
    }
    
    // Sign out the newly created user
    await supabase.auth.signOut();
    
    return { success: true, message: 'Admin user created successfully. You can now sign in with the admin credentials.' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
}

export function isAdminEmail(email: string): boolean {
  const approvedEmails = ['diggs844037@yahoo.com', 'drewdiggs844037@gmail.com'];
  return approvedEmails.includes(email);
}