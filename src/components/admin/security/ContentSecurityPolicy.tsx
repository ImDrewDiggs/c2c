import { useEffect } from 'react';

// Enhanced Content Security Policy component
export function ContentSecurityPolicy() {
  useEffect(() => {
    // Create and apply CSP meta tag
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    
    // Enhanced CSP with tighter restrictions
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://iagkylxqlartqokuiahf.supabase.co wss://iagkylxqlartqokuiahf.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
      "frame-ancestors 'none'", // Prevent clickjacking
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    meta.setAttribute('content', cspDirectives);
    
    // Only add if not already present
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      document.head.appendChild(meta);
    }

    // Add additional security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=()' }
    ];

    securityHeaders.forEach(({ name, content }) => {
      const existing = document.querySelector(`meta[http-equiv="${name}"]`);
      if (!existing) {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute('http-equiv', name);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    });

    return () => {
      // Cleanup on unmount
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspMeta && cspMeta === meta) {
        document.head.removeChild(meta);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

// CORS configuration helper
export const corsConfig = {
  allowedOrigins: [
    'https://100289ea-3c34-415f-a645-b7b29b76a548.lovableproject.com',
    'https://iagkylxqlartqokuiahf.supabase.co'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'apikey',
    'X-Client-Info'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};