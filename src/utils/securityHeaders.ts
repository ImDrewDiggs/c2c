/**
 * Security Headers Configuration
 * Provides consistent security headers across the application
 */

import { SECURITY_CONFIG } from './securityConfig';

export const securityHeaders = {
  ...SECURITY_CONFIG.headers,
  'Content-Security-Policy': Object.entries(SECURITY_CONFIG.csp)
    .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
    .join('; ')
} as const;

/**
 * Apply security headers to response
 */
export function withSecurityHeaders(response: Response): Response {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Create security headers for edge functions
 */
export function createSecureResponse(body: any, options: ResponseInit = {}): Response {
  const response = new Response(body, {
    ...options,
    headers: {
      ...securityHeaders,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      ...options.headers
    }
  });
  
  return response;
}