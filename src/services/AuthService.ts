import { supabase } from "@/lib/supabase";
import { UserData } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

/**
 * AuthService - Centralized service for authentication operations
 * 
 * This service handles all authentication-related operations including:
 * - Login/logout
 * - Role verification
 * - User profile management
 * - Session handling
 */
export class AuthService {
  // Static property for admin email
  static readonly ADMIN_EMAIL: string = 'diggs844037@yahoo.com';
  
  /**
   * Check if an email is the admin email
   */
  static isAdminEmail(email?: string | null): boolean {
    return email === this.ADMIN_EMAIL;
  }
  
  /**
   * Check if user has specific role
   */
  static async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      // Admin email always has access
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email === this.ADMIN_EMAIL) {
        return true;
      }
      
      // Check profile in database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('[AuthService] Error checking user role:', error);
        return false;
      }
      
      return profile?.role === 'admin' || profile?.role === requiredRole;
    } catch (err) {
      console.error('[AuthService] Error in checkUserRole:', err);
      return false;
    }
  }
  
  /**
   * Ensure admin profile exists using the database function
   */
  static async ensureAdminProfile(userId: string, email: string): Promise<boolean> {
    try {
      if (!this.isAdminEmail(email)) {
        return false;
      }

      console.log('[AuthService] Creating admin profile using database function');
      
      const { error } = await supabase.rpc('create_admin_profile', {
        admin_user_id: userId,
        admin_email: email
      });

      if (error) {
        console.error('[AuthService] Error calling create_admin_profile:', error);
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
   * Sign in with email and password
   */
  static async signIn(email: string, password: string, role: UserData['role']): Promise<{
    user: User | null;
    session: Session | null;
    role: string;
    error?: Error;
  }> {
    try {
      console.log(`[AuthService] Attempting to sign in as ${role} with email: ${email}`);
      
      // Special case for admin email - bypass role checking
      const isAdmin = this.isAdminEmail(email);
      
      // Clear any existing session first to prevent conflicts
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AuthService] Sign in error:', signInError);
        return { user: null, session: null, role: '', error: signInError };
      }

      if (!signInData.user) {
        console.error('[AuthService] No user returned from sign in');
        return { user: null, session: null, role: '', error: new Error('No user returned from sign in') };
      }

      // Special handling for admin email
      if (isAdmin) {
        console.log('[AuthService] Admin user login detected');
        try {
          await this.ensureAdminProfile(signInData.user.id, email);
        } catch (profileError) {
          console.error('[AuthService] Error handling admin profile:', profileError);
          // Continue with admin access even if profile handling fails
        }
        
        return { 
          user: signInData.user,
          session: signInData.session,
          role: 'admin'
        };
      }
      
      // For non-admin users, check role
      try {
        // Try to fetch the profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle();
          
        if (profileError) {
          throw profileError;
        }
        
        if (profile) {
          // Check if the role matches
          if (profile.role !== role && !isAdmin) {
            await supabase.auth.signOut();
            return { 
              user: null, 
              session: null, 
              role: '', 
              error: new Error(`Invalid role for this login portal. You tried to login as ${role} but your account is registered as ${profile.role}.`)
            };
          }
          
          return {
            user: signInData.user,
            session: signInData.session,
            role: profile.role
          };
        } else {
          // No profile found, create one
          const defaultUserData: Partial<UserData> = {
            id: signInData.user.id,
            email: email,
            role: role,
            full_name: email.split('@')[0]
          };
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert(defaultUserData);
            
          if (createError) {
            await supabase.auth.signOut();
            return { 
              user: null, 
              session: null, 
              role: '', 
              error: new Error('Error creating user profile')
            };
          }
          
          return {
            user: signInData.user,
            session: signInData.session,
            role: role
          };
        }
      } catch (profileError: any) {
        await supabase.auth.signOut();
        return { 
          user: null, 
          session: null, 
          role: '', 
          error: new Error('Error verifying user profile')
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
   * Sign out
   */
  static async signOut(): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      return {};
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Get current session
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
   * Fetch user profile data
   */
  static async fetchUserProfile(userId: string): Promise<{
    profile: UserData | null;
    error?: Error;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        return { profile: null, error };
      }
      
      if (!data) {
        // Check if this is the admin email
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user?.email === this.ADMIN_EMAIL) {
          // Create temporary admin data
          const adminData: UserData = {
            id: userId,
            email: this.ADMIN_EMAIL,
            role: 'admin',
            full_name: 'Administrator',
          };
          
          // Try to create the profile in the background
          this.ensureAdminProfile(userId, this.ADMIN_EMAIL).catch(err => {
            console.warn('[AuthService] Admin profile creation failed:', err.message);
          });
          
          return { profile: adminData };
        }
        
        return { profile: null };
      }
      
      return { profile: data as UserData };
    } catch (error: any) {
      return { profile: null, error };
    }
  }
}
