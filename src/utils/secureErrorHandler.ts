import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SecureError {
  userMessage: string;
  userDescription?: string;
  variant?: 'default' | 'destructive';
}

export class SecureErrorHandler {
  private static isProduction = process.env.NODE_ENV === 'production';
  
  static sanitizeError(error: any): SecureError {
    // Never expose internal error details in production
    if (this.isProduction) {
      return this.getGenericError(error);
    }
    
    // In development, show more detailed errors but still sanitized
    return this.getDetailedError(error);
  }
  
  private static getGenericError(error: any): SecureError {
    // Map common error types to user-friendly messages
    if (error?.message?.includes('auth')) {
      return {
        userMessage: 'Authentication Error',
        userDescription: 'Please check your credentials and try again.',
        variant: 'destructive'
      };
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        userMessage: 'Connection Error',
        userDescription: 'Please check your internet connection and try again.',
        variant: 'destructive'
      };
    }
    
    if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
      return {
        userMessage: 'Permission Denied',
        userDescription: 'You do not have permission to perform this action.',
        variant: 'destructive'
      };
    }
    
    return {
      userMessage: 'Something went wrong',
      userDescription: 'Please try again later or contact support if the problem persists.',
      variant: 'destructive'
    };
  }
  
  private static getDetailedError(error: any): SecureError {
    // Still sanitize even in development
    const message = error?.message || 'Unknown error';
    const sanitizedMessage = message
      .replace(/password/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/key/gi, '[REDACTED]');
      
    return {
      userMessage: 'Error',
      userDescription: sanitizedMessage,
      variant: 'destructive'
    };
  }
  
  static async logSecurityEvent(
    eventType: string,
    details: any,
    userId?: string
  ): Promise<void> {
    try {
      // Log security events to audit table
      await supabase.from('security_audit_logs').insert({
        user_id: userId,
        event_type: eventType,
        event_details: details,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  private static async getClientIP(): Promise<string | null> {
    try {
      // In a real app, you might get this from a header or service
      return null; // Simplified for this example
    } catch {
      return null;
    }
  }
}

// Hook for handling errors securely
export function useSecureErrorHandler() {
  const { toast } = useToast();
  
  const handleError = (error: any, context?: string) => {
    const secureError = SecureErrorHandler.sanitizeError(error);
    
    toast({
      title: secureError.userMessage,
      description: secureError.userDescription,
      variant: secureError.variant,
    });
    
    // Log error for admin review
    if (context) {
      SecureErrorHandler.logSecurityEvent('error_occurred', {
        context,
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  return { handleError };
}