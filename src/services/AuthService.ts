
import { supabase } from "@/lib/supabase";
import { UserData } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { validateEmail, validatePassword, sanitizeInput } from "@/utils/validation";

/**
 * AuthService - Centralized service for authentication operations
 * 
 * This service handles all authentication-related operations including:
 * - Login/logout with enhanced security
 * - Role verification via server-side functions
 * - User profile management
 * - Session handling with improved security
 */
export class AuthService {
  // Admin emails are now checked server-side via RLS policies
  static readonly ADMIN_EMAILS: string[] = [
    'diggs844037@yahoo.com',
    'drewdiggs844037@gmail.com'
  ];
  
  /**
   * Check if an email is an admin email (client-side fallback only)
   * Primary check should be server-side via RLS
   */
  static isAdminEmail(email?: string | null): boolean {
    return email ? this.ADMIN_EMAILS.includes(email) : false;
  }
  
  /**
   * Enhanced role checking with server-side validation
   */
  static async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      // Use server-side function for role checking to prevent client manipulation
      const { data: hasRole, error } = await supabase.rpc('check_user_has_role', {
        user_id: userId,
        required_role: requiredRole
      });
      
      if (error) {
        console.error('[AuthService] Error checking user role:', error);
        return false;
      }
      
      return hasRole === true;
    } catch (err) {
      console.error('[AuthService] Error in checkUserRole:', err);
      return false;
    }
  }
  
  /**
   * Ensure admin profile exists using the safe database function
   */
  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    try {
      if (!this.isAdminEmail(email)) {
        return false;
      }

      console.log('[AuthService] Creating admin profile using safe database function');
      
      const { error } = await supabase.rpc('create_admin_profile_safe', {
        admin_user_id: userId,
        admin_email: email
      });

      if (error) {
        console.error('[AuthService] Error calling create_admin_profile_safe:', error);
        return false;
      }

      console.log('[AuthService] Admin profile created successfully');
      return true;
    } catch (err) {
      console.error('[AuthService] Failed to create admin profile:', err);
      return false;
    }
  }

  /**
   * Enhanced sign in with better validation and security
   */
  static async signIn(email: string, password: string, role: UserData['role']): Promise<{
    user: User | null;
    session: Session | null;
    role: string;
    error?: Error;
  }> {
    try {
      // Input validation
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      
      if (!validateEmail(sanitizedEmail)) {
        return { user: null, session: null, role: '', error: new Error('Invalid email format') };
      }
      
      if (!password || password.length < 6) {
        return { user: null, session: null, role: '', error: new Error('Password must be at least 6 characters') };
      }

      console.log(`[AuthService] Attempting to sign in as ${role} with email: ${sanitizedEmail}`);
      
      // Special case for admin email - bypass role checking
      const isAdmin = this.isAdminEmail(sanitizedEmail);
      
      // Clear any existing session first to prevent conflicts
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (signInError) {
        console.error('[AuthService] Sign in error:', signInError);
        
        // Provide more specific error messages
        if (signInError.message.includes('Invalid login credentials')) {
          return { user: null, session: null, role: '', error: new Error('Invalid email or password') };
        }
        
        return { user: null, session: null, role: '', error: signInError };
      }

      if (!signInData.user) {
        console.error('[AuthService] No user returned from sign in');
        return { user: null, session: null, role: '', error: new Error('Authentication failed') };
      }

      // For admin users, use server-side validation
      if (isAdmin) {
        console.log('[AuthService] Admin user login detected');
        try {
          await this.ensureAdminProfile(signInData.user.id, sanitizedEmail);
        } catch (profileError) {
          console.error('[AuthService] Error handling admin profile:', profileError);
        }
        
        return { 
          user: signInData.user,
          session: signInData.session,
          role: 'admin'
        };
      }
      
      // For non-admin users, check role via server-side function
      try {
        const hasRequiredRole = await this.checkUserRole(signInData.user.id, role);
        
        if (!hasRequiredRole) {
          await supabase.auth.signOut();
          return { 
            user: null, 
            session: null, 
            role: '', 
            error: new Error(`Access denied. This account is not authorized for ${role} access.`)
          };
        }
        
        return {
          user: signInData.user,
          session: signInData.session,
          role: role
        };
      } catch (roleError: any) {
        await supabase.auth.signOut();
        return { 
          user: null, 
          session: null, 
          role: '', 
          error: new Error('Error verifying user permissions')
        };
      }
    } catch (error: any) {
      return { 
        user: null, 
        session: null, 
        role: '', 
        error: error
      };
    }
  }

  /**
   * Sign out with enhanced cleanup
   */
  static async signOut(): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      
      // Clear any cached data
      localStorage.removeItem('can2curb-user-cache');
      
      return {};
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Get current session with enhanced error handling
   */
  static async getSession(): Promise<{ 
    user: User | null,
    session: Session | null,
    error?: Error
  }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { user: null, session: null, error };
      }
      return { 
        user: data.session?.user || null, 
        session: data.session || null 
      };
    } catch (error: any) {
      return { user: null, session: null, error };
    }
  }

  /**
   * Fetch user profile data with enhanced security
   */
  static async fetchUserProfile(userId: string): Promise<{
    profile: UserData | null;
    error?: Error;
  }> {
    try {
      // Use server-side function for profile fetching to ensure RLS compliance
      const { data, error } = await supabase.rpc('get_user_profile', {
        target_user_id: userId
      });
        
      if (error) {
        return { profile: null, error };
      }
      
      return { profile: data as UserData };
    } catch (error: any) {
      return { profile: null, error };
    }
  }
}
