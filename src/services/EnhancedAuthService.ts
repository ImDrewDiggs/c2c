/**
 * Enhanced Authentication Service with RBAC Integration
 * Replaces the old AuthService with database-driven role management
 */

import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/integrations/supabase/client';
import { 
  rateLimiter, 
  auditLogger, 
  permissionManager, 
  validateSecureInput,
  createPasswordSchema,
  emailSchema 
} from '@/utils/securityManager';

export class EnhancedAuthService {
  /**
   * Sign in with enhanced security features
   */
  static async signIn(
    email: string, 
    password: string, 
    role: UserData['role'] = 'customer'
  ): Promise<{
    success: boolean;
    user?: any;
    error?: string;
    role?: string;
  }> {
    const identifier = email.toLowerCase();
    
    try {
      // Validate inputs
      const emailValidation = await validateSecureInput(
        emailSchema,
        email,
        {
          identifier,
          actionType: 'login_attempt',
          maxAttempts: 5,
          windowMinutes: 15
        }
      );

      if (emailValidation.success === false) {
        return { success: false, error: emailValidation.error };
      }

      // Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.data,
        password,
      });

      if (error) {
        await auditLogger.log({
          actionType: 'login_failed',
          riskLevel: 'medium',
          metadata: { 
            email: emailValidation.data, 
            error: error.message,
            attempted_role: role 
          }
        });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user roles from new RBAC system
      const userRoles = await permissionManager.getUserRoles(data.user.id);
      const isAdmin = await permissionManager.isAdmin(data.user.id);
      const actualRole = isAdmin ? 'admin' : (userRoles[0] || 'customer');

      // Ensure user profile exists with correct role
      await this.ensureUserProfile(data.user.id, emailValidation.data, actualRole);

      // Log successful login
      await auditLogger.log({
        actionType: 'login_successful',
        riskLevel: 'low',
        metadata: { 
          email: emailValidation.data,
          role: actualRole,
          roles: userRoles
        }
      });

      return {
        success: true,
        user: data.user,
        role: actualRole
      };

    } catch (error: any) {
      console.error('Sign in error:', error);
      await auditLogger.log({
        actionType: 'login_error',
        riskLevel: 'high',
        metadata: { 
          email: identifier, 
          error: error.message 
        }
      });
      return { success: false, error: 'Authentication service error' };
    }
  }

  /**
   * Sign up with enhanced validation
   */
  static async signUp(
    email: string,
    password: string,
    userData?: {
      fullName?: string;
      phone?: string;
      role?: string;
    }
  ): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    const identifier = email.toLowerCase();

    try {
      // Validate email
      const emailValidation = await validateSecureInput(
        emailSchema,
        email,
        {
          identifier,
          actionType: 'signup_attempt',
          maxAttempts: 3,
          windowMinutes: 30
        }
      );

      if (emailValidation.success === false) {
        return { success: false, error: emailValidation.error };
      }

      // Validate password
      const passwordValidation = await validateSecureInput(
        createPasswordSchema(12),
        password
      );

      if (passwordValidation.success === false) {
        return { success: false, error: passwordValidation.error };
      }

      // Sign up with email redirect
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: emailValidation.data,
        password: passwordValidation.data,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData?.fullName || '',
            phone: userData?.phone || ''
          }
        }
      });

      if (error) {
        await auditLogger.log({
          actionType: 'signup_failed',
          riskLevel: 'medium',
          metadata: { 
            email: emailValidation.data, 
            error: error.message 
          }
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile
        await this.ensureUserProfile(
          data.user.id, 
          emailValidation.data, 
          userData?.role || 'customer',
          userData?.fullName,
          userData?.phone
        );

        await auditLogger.log({
          actionType: 'signup_successful',
          riskLevel: 'low',
          metadata: { 
            email: emailValidation.data,
            role: userData?.role || 'customer'
          }
        });
      }

      return {
        success: true,
        user: data.user
      };

    } catch (error: any) {
      console.error('Sign up error:', error);
      await auditLogger.log({
        actionType: 'signup_error',
        riskLevel: 'high',
        metadata: { 
          email: identifier, 
          error: error.message 
        }
      });
      return { success: false, error: 'Registration service error' };
    }
  }

  /**
   * Sign out with audit logging
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      await auditLogger.log({
        actionType: 'logout',
        riskLevel: 'low',
        metadata: { 
          email: userData.user?.email 
        }
      });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Sign out failed' };
    }
  }

  /**
   * Change password with enhanced validation
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, error: 'Not authenticated' };
      }

      const identifier = userData.user.id;

      // Rate limit password changes
      const rateLimit = await rateLimiter.checkLimit(
        identifier,
        'password_change',
        3,
        60
      );

      if (!rateLimit.allowed) {
        return { 
          success: false, 
          error: `Too many password change attempts. Try again after ${rateLimit.resetTime?.toLocaleTimeString()}` 
        };
      }

      // Validate new password
      const passwordValidation = await validateSecureInput(
        createPasswordSchema(12),
        newPassword
      );

      if (passwordValidation.success === false) {
        return { success: false, error: passwordValidation.error };
      }

      // Verify current password by attempting sign in
      const verifyResult = await supabase.auth.signInWithPassword({
        email: userData.user.email!,
        password: currentPassword
      });

      if (verifyResult.error) {
        await auditLogger.log({
          actionType: 'password_change_failed',
          riskLevel: 'medium',
          metadata: { 
            reason: 'invalid_current_password',
            email: userData.user.email 
          }
        });
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordValidation.data
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Reset rate limit on success
      await rateLimiter.resetLimit(identifier, 'password_change');

      await auditLogger.log({
        actionType: 'password_changed',
        riskLevel: 'high',
        metadata: { 
          email: userData.user.email 
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  /**
   * Ensure user profile exists with proper role assignment
   */
  private static async ensureUserProfile(
    userId: string, 
    email: string, 
    role: string = 'customer',
    fullName?: string,
    phone?: string
  ): Promise<boolean> {
    try {
      // Create/update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          role,
          full_name: fullName || 'User',
          phone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return false;
      }

      // Assign role in new RBAC system
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role as any,
          assigned_by: userId,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        // Don't fail completely if role assignment fails
      }

      return true;
    } catch (error) {
      console.error('Ensure profile error:', error);
      return false;
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(permission: string): Promise<boolean> {
    return await permissionManager.hasPermission(permission);
  }

  /**
   * Check if user is admin (backward compatibility)
   */
  static async isAdmin(): Promise<boolean> {
    return await permissionManager.isAdmin();
  }

  /**
   * Check if user is super admin
   */
  static async isSuperAdmin(): Promise<boolean> {
    return await permissionManager.isSuperAdmin();
  }
}

// Export for backward compatibility
export const AuthService = EnhancedAuthService;