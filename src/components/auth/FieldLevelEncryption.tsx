import { useCallback } from 'react';

/**
 * Hook for client-side field encryption utilities
 * Works with the server-side encrypt_sensitive_field function
 */
export function useFieldEncryption() {
  // Check if a field appears to be encrypted (basic heuristic)
  const isEncrypted = useCallback((value: string | null): boolean => {
    if (!value) return false;
    // Encrypted fields are hex strings of specific length (SHA-256 = 64 chars)
    return /^[a-f0-9]{64}$/i.test(value);
  }, []);

  // Mask sensitive data for display
  const maskSensitiveData = useCallback((value: string | null, fieldType: 'drivers_license' | 'phone' | 'email'): string => {
    if (!value) return '';
    
    if (isEncrypted(value)) {
      return '••••••••••••';
    }
    
    switch (fieldType) {
      case 'drivers_license':
        return value.length > 4 ? `****${value.slice(-4)}` : '****';
      case 'phone':
        return value.length > 4 ? `(***) ***-${value.slice(-4)}` : '****';
      case 'email':
        const [user, domain] = value.split('@');
        if (user && domain) {
          return `${user[0]}***@${domain}`;
        }
        return '***@***.com';
      default:
        return '••••••••';
    }
  }, [isEncrypted]);

  // Generate client-side hash for verification (not for storage)
  const generateHash = useCallback(async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  return {
    isEncrypted,
    maskSensitiveData,
    generateHash
  };
}