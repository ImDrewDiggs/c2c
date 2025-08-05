
import { supabase, UserData } from '@/integrations/supabase/client';

export class AuthService {
  static readonly ADMIN_EMAILS = [
    'diggs844037@yahoo.com',
    'drewdiggs844037@gmail.com'
  ];

  static isAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  static async signIn(email: string, password: string, role: UserData['role']) {
    try {
      console.log('[AuthService] Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthService] Sign in error:', error);
        return { error, user: null, role: null };
      }

      if (!data.user) {
        return { error: new Error('No user returned'), user: null, role: null };
      }

      console.log('[AuthService] Sign in successful for:', data.user.email);

      // Determine role based on email for admin users
      const actualRole = this.isAdminEmail(data.user.email) ? 'admin' : role;
      
      // For admin users, ensure profile exists
      if (actualRole === 'admin') {
        await this.ensureAdminProfile(data.user.id, data.user.email);
      }

      return { 
        error: null, 
        user: data.user, 
        role: actualRole 
      };
    } catch (error) {
      console.error('[AuthService] Unexpected sign in error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        user: null, 
        role: null 
      };
    }
  }

  static async signOut() {
    try {
      console.log('[AuthService] Signing out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthService] Sign out error:', error);
        return { error };
      }

      console.log('[AuthService] Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('[AuthService] Unexpected sign out error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }

  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    try {
      console.log('[AuthService] Ensuring admin profile for:', email);
      
      // Use the security definer function to safely create admin profile
      const { error } = await supabase.rpc('create_admin_profile_safe', {
        admin_user_id: userId,
        admin_email: email
      });

      if (error) {
        console.warn('[AuthService] Admin profile creation warning:', error);
        // Don't throw error for admin users - they should still be able to access
        return true;
      }

      console.log('[AuthService] Admin profile ensured for:', email);
      return true;
    } catch (error) {
      console.warn('[AuthService] Admin profile creation failed:', error);
      // Return true for admin emails even if profile creation fails
      return this.isAdminEmail(email);
    }
  }
}
