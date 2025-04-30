
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from './use-user-profile';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const { fetchUserData } = useUserProfile();

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[AuthSession] Starting initial session check');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('[AuthSession] User found in session:', session.user.email);
          setUser(session.user);
          
          // Fetch user profile but don't block on it
          fetchUserData(session.user.id).catch(err => {
            console.warn('[AuthSession] Profile fetch error, continuing anyway:', err.message);
          });
        } else {
          console.log('[AuthSession] No user in session during initial check');
          setUser(null);
        }
        
        setLoading(false);
        setSessionChecked(true);
      } catch (error) {
        console.error('[AuthSession] Error checking session:', error);
        setLoading(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [fetchUserData]);

  // Auth state change listener - only set up after initial session check
  useEffect(() => {
    if (!sessionChecked) {
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
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('[AuthSession] Unsubscribing from auth state change');
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  return { user, loading, sessionChecked };
}
