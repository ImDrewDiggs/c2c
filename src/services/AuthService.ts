
import { supabase } from "@/lib/supabase";
import { UserData } from "@/lib/supabase";

// Centralized admin email reference
export const ADMIN_EMAIL = 'diggs844037@yahoo.com';

export class AuthService {
  /**
   * Check if a user is an admin based on their email
   */
  static isAdminEmail(email: string | undefined): boolean {
    if (!email) return false;
    return email === ADMIN_EMAIL;
  }

  /**
   * Create an admin profile for a user if it doesn't exist
   */
  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    try {
      console.log('[AuthService] Ensuring admin profile exists for:', email);
      
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('[AuthService] Error checking for existing profile:', checkError);
        return false;
      }
      
      // If profile exists, just update it to admin role if needed
      if (existingProfile) {
        if (existingProfile.role !== 'admin' && this.isAdminEmail(email)) {
          console.log('[AuthService] Profile exists, updating to admin role');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
            
          if (updateError) {
            console.error('[AuthService] Error updating profile to admin:', updateError);
            return false;
          }
        }
        return true;
      }
      
      // If profile doesn't exist, create it
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          role: this.isAdminEmail(email) ? 'admin' : 'customer',
          full_name: 'Admin User'
        });
      
      if (error) {
        console.error('[AuthService] Error creating admin profile:', error);
        return false;
      }
      
      console.log('[AuthService] Successfully created profile for:', email);
      return true;
    } catch (err) {
      console.error('[AuthService] Failed to ensure admin profile:', err);
      return false;
    }
  }

  /**
   * Get current user session
   */
  static async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('[AuthService] Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserData;
    } catch (error) {
      console.error('[AuthService] Error getting user profile:', error);
      return null;
    }
  }
}
