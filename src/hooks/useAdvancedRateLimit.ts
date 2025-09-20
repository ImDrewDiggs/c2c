import { useState, useCallback } from 'react';
import { DatabaseRateLimiter } from '@/utils/securityManager';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts?: number;
  windowMinutes?: number;
}

export function useAdvancedRateLimit() {
  const [isLimited, setIsLimited] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  const checkLimit = useCallback(async (
    identifier: string,
    actionType: string,
    config: RateLimitConfig = {}
  ) => {
    try {
      const { maxAttempts = 5, windowMinutes = 15 } = config;
      const result = await DatabaseRateLimiter.checkLimit(
        identifier,
        actionType,
        maxAttempts,
        windowMinutes
      );

      if (!result.allowed) {
        setIsLimited(true);
        setAttemptsRemaining(0);
        
        toast({
          variant: "destructive",
          title: "Rate Limited",
          description: `Too many ${actionType} attempts. Try again later.`,
        });
        
        return false;
      }

      setIsLimited(false);
      setAttemptsRemaining(result.remaining);
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
  }, [toast]);

  const resetLimit = useCallback(async (identifier: string, actionType: string) => {
    try {
      await DatabaseRateLimiter.resetLimit(identifier, actionType);
      setIsLimited(false);
      setAttemptsRemaining(null);
    } catch (error) {
      console.error('Rate limit reset failed:', error);
    }
  }, []);

  return {
    checkLimit,
    resetLimit,
    isLimited,
    attemptsRemaining
  };
}