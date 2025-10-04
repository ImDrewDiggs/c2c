import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TermsAcceptance {
  id: string;
  user_id?: string;
  session_id?: string;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  terms_version: string;
}

export function useTermsAcceptance() {
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate or retrieve session ID for anonymous users
  useEffect(() => {
    let storedSessionId = localStorage.getItem('anonymous_session_id');
    if (!storedSessionId) {
      // Generate a simple random session ID
      storedSessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('anonymous_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Check if terms have been accepted
  const checkTermsAcceptance = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('has_accepted_terms', {
        check_session_id: sessionId
      });

      if (error) {
        console.error('Error checking terms acceptance:', error);
        setHasAccepted(false);
        // Clear localStorage on error
        localStorage.removeItem('terms_accepted');
        localStorage.removeItem('terms_accepted_at');
      } else {
        // CRITICAL: Strictly enforce boolean check - data must be exactly true
        const accepted = data === true;
        setHasAccepted(accepted);
        
        // Cache in localStorage only after successful database verification
        if (accepted) {
          localStorage.setItem('terms_accepted', 'true');
          localStorage.setItem('terms_accepted_at', new Date().toISOString());
        } else {
          localStorage.removeItem('terms_accepted');
          localStorage.removeItem('terms_accepted_at');
        }
      }
    } catch (error) {
      console.error('Terms acceptance check failed:', error);
      setHasAccepted(false);
      // Clear localStorage on error
      localStorage.removeItem('terms_accepted');
      localStorage.removeItem('terms_accepted_at');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Record terms acceptance
  const acceptTerms = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      // Get client info for audit trail
      const userAgent = navigator.userAgent;
      const referer = document.referrer;
      
      // Get IP address is handled server-side via Supabase headers
      const { data, error } = await supabase.rpc('record_terms_acceptance', {
        p_session_id: sessionId,
        p_ip_address: null, // Server will capture from headers
        p_user_agent: userAgent,
        p_referer: referer || null
      });

      if (error) {
        console.error('Error recording terms acceptance:', error);
        return false;
      }

      if (data) {
        setHasAccepted(true);
        // Store acceptance in localStorage for quick client-side checks
        localStorage.setItem('terms_accepted', 'true');
        localStorage.setItem('terms_accepted_at', new Date().toISOString());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Terms acceptance recording failed:', error);
      return false;
    }
  }, [sessionId]);

  // Initialize check on mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      // Always verify with database first - no localStorage bypass
      checkTermsAcceptance();
    }
  }, [sessionId, checkTermsAcceptance]);

  return {
    hasAccepted,
    loading,
    sessionId,
    acceptTerms,
    checkTermsAcceptance
  };
}