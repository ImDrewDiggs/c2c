
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from './use-user-profile';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionCheckError, setSessionCheckError] = useState<Error | null>(null);
  const initialSessionCheckComplete = useRef(false);
  const authChangeSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  const { fetchUserData } = useUserProfile();

  // Initial session check
  useEffect(() => {
    let isMounted = true;
    
    // Skip if we've already done the initial check
    if (initialSessionCheckComplete.current) return;
    
    const checkSession = async () => {
      try {
        console.log('[AuthSession] Starting initial session check');
        setLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user && isMounted) {
          console.log('[AuthSession] User found in session:', session.user.email);
          setUser(session.user);
          
          // Fetch user profile but don't block on it
          fetchUserData(session.user.id).catch(err => {
            console.warn('[AuthSession] Profile fetch error, continuing anyway:', err.message);
          });
        } else if (isMounted) {
          console.log('[AuthSession] No user in session during initial check');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthSession] Error checking session:', error);
        if (isMounted) {
          setSessionCheckError(error instanceof Error ? error : new Error('Failed to check session'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setSessionChecked(true);
          initialSessionCheckComplete.current = true;
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [fetchUserData]);

  // Auth state change listener - only set up after initial session check
  useEffect(() => {
    if (!sessionChecked || authChangeSubscription.current) {
      return undefined;
    }
    
    console.log('[AuthSession] Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthSession] Auth state changed:', { event, userEmail: session?.user?.email });
      
      if (event === 'SIGNED_OUT') {
        console.log('[AuthSession] SIGNED_OUT event received, clearing user state');
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        // Don't fetch profile data here to avoid potential deadlocks
        // Use setTimeout to defer any additional operations
        setTimeout(() => {
          fetchUserData(session.user.id).catch(err => {
            console.warn('[AuthSession] Profile fetch after state change error:', err.message);
          });
        }, 100);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    authChangeSubscription.current = subscription;

    return () => {
      console.log('[AuthSession] Unsubscribing from auth state change');
      if (authChangeSubscription.current) {
        authChangeSubscription.current.unsubscribe();
        authChangeSubscription.current = null;
      }
    };
  }, [sessionChecked, fetchUserData]);

  return { 
    user, 
    loading, 
    sessionChecked,
    error: sessionCheckError 
  };
}
