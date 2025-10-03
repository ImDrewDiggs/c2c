import { supabase } from '@/integrations/supabase/client';

/**
 * SECURITY NOTICE: This file has been deprecated due to security vulnerabilities
 * Admin user creation should be done through secure channels only
 * 
 * Critical security issues with this approach:
 * 1. Insecure password collection via prompt()
 * 2. Multiple admin emails allowed
 * 3. No rate limiting or security logging
 * 4. Potential credential exposure in client-side code
 */

/**
 * @deprecated Use proper admin management interface instead
 * This function is kept for backward compatibility but should not be used
 */
export async function createSecureAdminUser(adminEmail: string, adminPassword: string) {
  // SECURITY: This function is deprecated and should not be used
  console.warn('⚠️ SECURITY WARNING: createSecureAdminUser is deprecated and insecure');
  
  return {
    success: false,
    message: 'Admin creation via this method is disabled for security reasons. Please contact system administrator.'
  };
}
    

export function isAdminEmail(email: string): boolean {
  // SECURITY: Restricted to single admin for security
  const approvedEmails = ['diggs844037@yahoo.com'];
  return approvedEmails.includes(email);
}