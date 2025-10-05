import DOMPurify from 'dompurify';

/**
 * SECURITY: Enhanced input sanitization using DOMPurify
 * This provides comprehensive XSS protection
 */

// Configure DOMPurify for strict sanitization
const sanitizerConfig = {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true, // Keep text content, remove tags
};

/**
 * Sanitize user input to prevent XSS attacks
 * Uses DOMPurify for comprehensive protection
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // First pass: DOMPurify sanitization
  const sanitized = DOMPurify.sanitize(input, sanitizerConfig);
  
  // Second pass: Additional hardening
  return sanitized
    .trim()
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '');
};

/**
 * Sanitize HTML content (for rich text editors)
 * Allows safe HTML tags only
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  const sanitized = url.trim();
  
  // Block dangerous protocols
  if (sanitized.match(/^(javascript|data|vbscript):/i)) {
    console.warn('⚠️ SECURITY: Blocked dangerous URL protocol');
    return '';
  }
  
  return sanitized;
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Sanitize phone numbers
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except + for international numbers
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = {} as T;
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as any;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as any;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
