/**
 * Enhanced security validation utilities
 * Provides comprehensive validation for security-sensitive operations
 */

import { z } from 'zod';

// Enhanced password schema with strict requirements
export const securePasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for common weak patterns
    const weakPatterns = [
      /^(.)\1+$/, // All same character
      /123456/, // Sequential numbers
      /password/i, // Contains "password"
      /admin/i, // Contains "admin"
      /qwerty/i, // Contains "qwerty"
    ];
    
    return !weakPatterns.some(pattern => pattern.test(password));
  }, 'Password contains weak patterns');

// Admin email validation
export const adminEmailSchema = z.string()
  .email('Invalid email format')
  .refine(
    (email) => email === 'diggs844037@yahoo.com',
    'Only authorized admin email allowed'
  );

// Security rate limiting
class SecurityRateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (record.count >= this.maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export rate limiters for different operations
export const authRateLimiter = new SecurityRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min
export const adminActionRateLimiter = new SecurityRateLimiter(10, 5 * 60 * 1000); // 10 actions per 5 min

// Input sanitization for XSS prevention
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: schemes
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Secure validation helper
export function validateSecureInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  identifier?: string
): { success: true; data: T } | { success: false; error: string } {
  try {
    // Check rate limiting if identifier provided
    if (identifier && authRateLimiter.isRateLimited(identifier)) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    const result = schema.parse(input);
    
    // Reset rate limit on successful validation
    if (identifier) {
      authRateLimiter.reset(identifier);
    }
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const;

// Log security events
export async function logSecurityEvent(
  event: {
    type: string;
    userId?: string;
    details?: Record<string, any>;
    level?: 'low' | 'medium' | 'high' | 'critical';
  }
) {
  try {
    // In a real implementation, this would send to a logging service
    console.log(`[SECURITY EVENT] ${event.type}:`, {
      timestamp: new Date().toISOString(),
      ...event
    });
    
    // Could also send to external security monitoring service
    // await sendToSecurityService(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}