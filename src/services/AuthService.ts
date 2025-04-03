
import { supabase } from "@/lib/supabase";

export class AuthService {
  // Static property for admin email
  static readonly ADMIN_EMAIL: string = 'diggs844037@yahoo.com';
  
  // Check if an email is the admin email
  static isAdminEmail(email?: string | null): boolean {
    return email === this.ADMIN_EMAIL;
  }
  
  // Ensure admin profile exists
  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    try {
      console.log('[AuthService] Ensuring admin profile exists for:', email);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('[AuthService] Error checking for existing profile:', checkError);
      }
      
      // If profile exists, update to admin role
      if (existingProfile) {
        console.log('[AuthService] Profile exists, updating to admin role');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateError) {
          console.error('[AuthService] Error updating profile to admin:', updateError);
          // Return true for admin email even if update fails
          return email === this.ADMIN_EMAIL;
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
        console.error('[AuthService] Error creating admin profile:', error);
        // Return true for admin email even if creation fails
        return email === this.ADMIN_EMAIL;
      }
      
      console.log('[AuthService] Successfully created admin profile for:', email);
      return true;
    } catch (err) {
      console.error('[AuthService] Failed to create admin profile:', err);
      // For the admin email, we'll consider it a success even if there's an error
      return email === this.ADMIN_EMAIL;
    }
  }
}
