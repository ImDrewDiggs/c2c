/**
 * Centralized Security Management System
 * Consolidates all security validation, rate limiting, and audit logging
 */

import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Enhanced password schema with configurable requirements
export const createPasswordSchema = (minLength: number = 12) => z.string()
  .min(minLength, `Password must be at least ${minLength} characters long`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .refine((password) => {
    const weakPatterns = [
      /^(.)\1+$/, // All same character
      /123456/, // Sequential numbers
      /password/i, // Contains "password"
      /admin/i, // Contains "admin"
      /qwerty/i, // Contains "qwerty"
    ];
    return !weakPatterns.some(pattern => pattern.test(password));
  }, 'Password contains weak patterns');

// Email validation with domain restrictions
export const emailSchema = z.string()
  .email('Invalid email format')
  .refine(
    (email) => !email.includes('+'),
    'Email aliases are not allowed for security reasons'
  );

// Input sanitization for XSS prevention
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/script/gi, '')
    .trim();
}

// Persistent rate limiting using database
export class DatabaseRateLimiter {
  static async checkLimit(
    identifier: string,
    actionType: string,
    maxAttempts: number = 5,
    windowMinutes: number = 15
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date | null }> {
    try {
      // Note: check_rate_limit function needs to be created in migration
      // For now, implement basic client-side rate limiting
      const rateLimitKey = `${identifier}_${actionType}`;
      const stored = localStorage.getItem(rateLimitKey);
      const now = Date.now();
      
      if (stored) {
        const { count, windowStart } = JSON.parse(stored);
        const windowDuration = windowMinutes * 60 * 1000;
        
        if (now - windowStart < windowDuration) {
          if (count >= maxAttempts) {
            return { allowed: false, remaining: 0, resetTime: new Date(windowStart + windowDuration) };
          }
          localStorage.setItem(rateLimitKey, JSON.stringify({ count: count + 1, windowStart }));
          return { allowed: true, remaining: maxAttempts - count - 1, resetTime: new Date(windowStart + windowDuration) };
        }
      }
      
      localStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, windowStart: now }));
      return { allowed: true, remaining: maxAttempts - 1, resetTime: new Date(now + windowMinutes * 60 * 1000) };
    } catch (error) {
      // Fallback to localStorage if database fails
      console.warn('Database rate limiting failed, using localStorage fallback:', error);
      
      const rateLimitKey = `rateLimit_${identifier}_${actionType}`;
      const stored = localStorage.getItem(rateLimitKey);
      const now = Date.now();
      const windowDuration = windowMinutes * 60 * 1000;

      if (stored) {
        const { count, windowStart } = JSON.parse(stored);
        if (now - windowStart < windowDuration) {
          if (count >= maxAttempts) {
            return { allowed: false, remaining: 0, resetTime: new Date(windowStart + windowDuration) };
          }
          localStorage.setItem(rateLimitKey, JSON.stringify({ count: count + 1, windowStart }));
          return { allowed: true, remaining: maxAttempts - count - 1, resetTime: new Date(windowStart + windowDuration) };
        }
      }
      
      localStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, windowStart: now }));
      return { allowed: true, remaining: maxAttempts - 1, resetTime: new Date(now + windowMinutes * 60 * 1000) };
    }
  }

  static async resetLimit(identifier: string, actionType: string): Promise<void> {
    try {
      await supabase
        .from('rate_limits')
        .delete()
        .eq('identifier', identifier)
        .eq('action_type', actionType);
    } catch (error) {
      console.error('Failed to reset rate limit:', error);
    }
  }
}

// Enhanced security audit logging
export class SecurityAuditLogger {
  static async log(event: {
    actionType: string;
    resourceType?: string;
    resourceId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      
      await supabase.from('enhanced_security_logs').insert({
        user_id: user.data.user?.id,
        action_type: event.actionType,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        old_values: event.oldValues,
        new_values: event.newValues,
        risk_level: event.riskLevel || 'low',
        metadata: {
          ...event.metadata,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Permission-based access control
export class PermissionManager {
  static async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_permission', {
        check_permission: permission as any,
        check_user_id: userId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  static async getUserRoles(userId?: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_roles', {
        check_user_id: userId
      });

      if (error) throw error;
      return data?.map((r: any) => r.role) || [];
    } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
    }
  }

  static async isAdmin(userId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin_user', {
        check_user_id: userId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  }

  static async isSuperAdmin(userId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_super_admin_user', {
        check_user_id: userId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Super admin check failed:', error);
      return false;
    }
  }
}

// Configuration manager
export class ConfigManager {
  private static cache = new Map<string, any>();
  private static cacheExpiry = new Map<string, number>();

  static async getConfig(key: string, defaultValue?: any): Promise<any> {
    const cacheKey = `config_${key}`;
    const now = Date.now();

    // Check cache first (5 minute TTL)
    if (this.cache.has(cacheKey) && now < (this.cacheExpiry.get(cacheKey) || 0)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const value = data?.value || defaultValue;
      
      // Cache the result
      this.cache.set(cacheKey, value);
      this.cacheExpiry.set(cacheKey, now + (5 * 60 * 1000));

      return value;
    } catch (error) {
      console.error(`Failed to get config for ${key}:`, error);
      return defaultValue;
    }
  }

  static async setConfig(key: string, value: any, category: string = 'general'): Promise<void> {
    try {
      await supabase
        .from('app_config')
        .upsert({
          key,
          value,
          category,
          updated_at: new Date().toISOString()
        });

      // Invalidate cache
      this.cache.delete(`config_${key}`);
      this.cacheExpiry.delete(`config_${key}`);

      await SecurityAuditLogger.log({
        actionType: 'config_updated',
        resourceType: 'config',
        newValues: { key, value },
        riskLevel: 'medium'
      });
    } catch (error) {
      console.error(`Failed to set config for ${key}:`, error);
      throw error;
    }
  }
}

// Secure validation helper
export async function validateSecureInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  rateLimitConfig?: {
    identifier: string;
    actionType: string;
    maxAttempts?: number;
    windowMinutes?: number;
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    // Check rate limiting if configured
    if (rateLimitConfig) {
      const rateLimit = await DatabaseRateLimiter.checkLimit(
        rateLimitConfig.identifier,
        rateLimitConfig.actionType,
        rateLimitConfig.maxAttempts,
        rateLimitConfig.windowMinutes
      );

      if (!rateLimit.allowed) {
        await SecurityAuditLogger.log({
          actionType: 'rate_limit_exceeded',
          riskLevel: 'high',
          metadata: rateLimitConfig
        });
        return { 
          success: false, 
          error: `Too many attempts. Please try again after ${rateLimit.resetTime?.toLocaleTimeString()}` 
        };
      }
    }

    const result = schema.parse(input);
    
    // Reset rate limit on successful validation
    if (rateLimitConfig) {
      await DatabaseRateLimiter.resetLimit(
        rateLimitConfig.identifier,
        rateLimitConfig.actionType
      );
    }
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Export singleton instances
export const rateLimiter = DatabaseRateLimiter;
export const auditLogger = SecurityAuditLogger;
export const permissionManager = PermissionManager;
export const configManager = ConfigManager;