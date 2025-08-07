import { z } from 'zod';

// XSS protection - sanitize HTML input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Comprehensive validation schemas
export const customerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number format"),
  serviceAddress: z.string().min(5, "Service address is required").max(200, "Address too long"),
  billingAddress: z.string().min(5, "Billing address is required").max(200, "Address too long"),
  city: z.string().min(1, "City is required").max(50, "City name too long"),
  state: z.string().min(2, "State is required").max(2, "Invalid state format"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  specialInstructions: z.string().max(500, "Instructions too long").optional(),
});

export const pickupSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(100, "Name too long"),
  customerEmail: z.string().email("Invalid email format").optional(),
  customerPhone: z.string().regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number format").optional(),
  address: z.string().min(5, "Address is required").max(200, "Address too long"),
  serviceType: z.enum(['residential', 'commercial', 'bulk', 'recycling', 'yard-waste'], {
    errorMap: () => ({ message: "Invalid service type" })
  }),
  notes: z.string().max(500, "Notes too long").optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent'], {
    errorMap: () => ({ message: "Invalid priority level" })
  }),
});

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Validate and sanitize form data
export function validateAndSanitizeCustomerInfo(data: any) {
  // Sanitize all string fields
  const sanitizedData = Object.keys(data).reduce((acc, key) => {
    if (typeof data[key] === 'string') {
      acc[key] = sanitizeInput(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);

  // Validate with schema
  return customerInfoSchema.parse(sanitizedData);
}

export function validateAndSanitizePickupData(data: any) {
  // Sanitize all string fields
  const sanitizedData = Object.keys(data).reduce((acc, key) => {
    if (typeof data[key] === 'string') {
      acc[key] = sanitizeInput(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);

  // Validate with schema
  return pickupSchema.parse(sanitizedData);
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    record.lastAttempt = now;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute