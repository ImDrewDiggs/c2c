
import { supabase } from '@/lib/supabase';

export const ADMIN_CREDENTIALS = {
  email: 'diggs844037@yahoo.com',
  password: '1Lilwayne!!'
};

export async function createAdminUser() {
  try {
    console.log('Creating admin user account...');
    
    // Try to sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      options: {
        data: {
          full_name: 'Administrator'
        }
      }
    });

    if (error) {
      // If user already exists, that's okay
      if (error.message.includes('already registered')) {
        console.log('Admin user already exists');
        return { success: true, message: 'Admin user already exists' };
      }
      throw error;
    }

    if (data.user) {
      // Create or update the profile to ensure admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
          full_name: 'Administrator'
        });

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
      }
    }

    return { success: true, message: 'Admin user created successfully' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
}
