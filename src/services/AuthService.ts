
import { supabase, UserData } from '@/integrations/supabase/client';

/**
 * SECURITY: Admin checks are now performed via RBAC system.
 * Use permissionManager.isAdmin() instead of checking emails.
 */
export class AuthService {
  /**
   * @deprecated Use RBAC system instead
   */
  static readonly ADMIN_EMAILS: string[] = [];

  static isAdminEmail(email?: string | null): boolean {
    console.warn('⚠️ DEPRECATED: isAdminEmail is deprecated. Use RBAC checks instead.');
    return false;
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

      console.log('[AuthService] Sign in successful');

      // Role is now determined by user_roles table, not by email
      // No client-side role assignment for security

      return { 
        error: null, 
        user: data.user, 
        role: role 
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

  /**
   * @deprecated Admin profiles are now managed via user_roles table
   */
  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    console.warn('⚠️ DEPRECATED: ensureAdminProfile is no longer used. Admin roles managed via RBAC.');
    return false;
  }
}
