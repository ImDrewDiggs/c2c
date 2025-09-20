/**
 * Centralized Security Configuration
 * Contains all security-related settings and policies
 */

export const SECURITY_CONFIG = {
  // Rate Limiting Configuration
  rateLimits: {
    login: {
      customer: { maxAttempts: 5, windowMinutes: 15 },
      employee: { maxAttempts: 5, windowMinutes: 15 },
      admin: { maxAttempts: 3, windowMinutes: 15 }
    },
    passwordReset: { maxAttempts: 3, windowMinutes: 60 },
    emailVerification: { maxAttempts: 5, windowMinutes: 10 },
    apiRequests: { maxAttempts: 100, windowMinutes: 1 }
  },

  // Session Security
  session: {
    maxDuration: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    adminMaxDuration: 4 * 60 * 60 * 1000, // 4 hours for admin
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    adminInactivityTimeout: 15 * 60 * 1000, // 15 minutes for admin
    sessionRotationInterval: 60 * 60 * 1000, // 1 hour
    maxConcurrentSessions: 3,
    adminMaxConcurrentSessions: 1
  },

  // Password Policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPatterns: [
      'password', 'admin', 'qwerty', '123456', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'superman'
    ],
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    historyCount: 12 // Remember last 12 passwords
  },

  // Multi-Factor Authentication
  mfa: {
    required: {
      admin: true,
      employee: false,
      customer: false
    },
    otpExpiry: 10 * 60 * 1000, // 10 minutes
    backupCodesCount: 8,
    methods: ['email', 'totp', 'backup_codes']
  },

  // Security Monitoring
  monitoring: {
    suspiciousActivityThresholds: {
      failedLogins: 5,
      rapidRequests: 50,
      unusualLocations: true,
      deviceChanges: true
    },
    alertLevels: {
      low: { notifyAdmin: false, logOnly: true },
      medium: { notifyAdmin: true, logOnly: false },
      high: { notifyAdmin: true, requireAction: true },
      critical: { notifyAdmin: true, autoBlock: true, requireAction: true }
    },
    dataRetention: {
      securityLogs: 365, // days
      auditLogs: 2555, // 7 years in days
      sessionLogs: 90 // days
    }
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: [
      "'self'",
      "https://iagkylxqlartqokuiahf.supabase.co",
      "https://*.stripe.com"
    ],
    frameSrc: ["'self'", "https://*.stripe.com"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
    manifestSrc: ["'self'"]
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Data Protection
  dataProtection: {
    encryptionAlgorithm: 'AES-256-GCM',
    hashingAlgorithm: 'SHA-256',
    sensitiveFields: [
      'email', 'phone', 'address', 'drivers_license',
      'payment_info', 'location_data'
    ],
    dataAnonymization: {
      locationPrecision: 2, // decimal places
      dataRetentionPeriod: 365, // days
      automaticDeletion: true
    }
  },

  // Compliance Settings
  compliance: {
    gdpr: {
      enabled: true,
      dataPortability: true,
      rightToErasure: true,
      consentRequired: true
    },
    ccpa: {
      enabled: true,
      doNotSell: true,
      disclosureRequired: true
    },
    hipaa: {
      enabled: false // Enable if handling health data
    }
  }
} as const;

// Security risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Security event types
export const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGIN_BLOCKED: 'login_blocked',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  SESSION_EXPIRED: 'session_expired',
  PASSWORD_CHANGED: 'password_changed',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  DATA_ACCESS: 'data_access',
  DATA_EXPORT: 'data_export',
  ADMIN_ACTION: 'admin_action',
  SECURITY_VIOLATION: 'security_violation'
} as const;

// Helper functions for security configuration
export const getConfigValue = (path: string, defaultValue?: any) => {
  const keys = path.split('.');
  let current: any = SECURITY_CONFIG;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
};

export const isFeatureEnabled = (feature: string): boolean => {
  return getConfigValue(feature, false) === true;
};

export const getRateLimitConfig = (action: string, role?: string) => {
  const path = `rateLimits.${action}${role ? `.${role}` : ''}`;
  return getConfigValue(path, SECURITY_CONFIG.rateLimits.apiRequests);
};

export const getSecurityLevel = (eventType: string): string => {
  switch (eventType) {
    case SECURITY_EVENTS.LOGIN_FAILED:
    case SECURITY_EVENTS.SUSPICIOUS_ACTIVITY:
      return RISK_LEVELS.MEDIUM;
    case SECURITY_EVENTS.LOGIN_BLOCKED:
    case SECURITY_EVENTS.SECURITY_VIOLATION:
      return RISK_LEVELS.HIGH;
    case SECURITY_EVENTS.MFA_DISABLED:
    case SECURITY_EVENTS.DATA_EXPORT:
      return RISK_LEVELS.CRITICAL;
    default:
      return RISK_LEVELS.LOW;
  }
};