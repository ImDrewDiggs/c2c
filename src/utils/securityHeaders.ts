/**
 * Security Headers Configuration
 * Provides consistent security headers across the application
 */

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://iagkylxqlartqokuiahf.supabase.co https://*.stripe.com; frame-src 'self' https://*.stripe.com;"
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