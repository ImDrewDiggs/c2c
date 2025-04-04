
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
        console.log('[DIAGNOSTIC][AuthSession] Starting initial session check');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[DIAGNOSTIC][AuthSession] Initial session check result:', {
          hasSession: !!session,
          userEmail: session?.user?.email || 'No user in session'
        });
        
        if (session?.user) {
          console.log('[DIAGNOSTIC][AuthSession] User found in session, setting user state');
          setUser(session.user);
          
          console.log('[DIAGNOSTIC][AuthSession] User found in session, will fetch profile:', session.user.id);
          // Attempt to fetch the user profile, but don't block auth on success
          await fetchUserData(session.user.id).catch(err => {
            console.warn('[DIAGNOSTIC][AuthSession] Profile fetch error, continuing anyway:', err.message);
          });
        } else {
          console.log('[DIAGNOSTIC][AuthSession] No user in session during initial check');
          setUser(null);
        }
        
        setLoading(false);
        setSessionChecked(true);
      } catch (error) {
        console.error('[DIAGNOSTIC][AuthSession] Error checking session:', error);
        setLoading(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Auth state change listener
  useEffect(() => {
    if (!sessionChecked) {
      console.log('[DIAGNOSTIC][AuthSession] Skipping auth change listener setup - session not checked yet');
      return () => {};
    }
    
    console.log('[DIAGNOSTIC][AuthSession] Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DIAGNOSTIC][AuthSession] Auth state changed:', {
        event,
        userEmail: session?.user?.email || 'No user',
        hasSession: !!session
      });
      
      if (event === 'SIGNED_OUT') {
        console.log('[DIAGNOSTIC][AuthSession] SIGNED_OUT event received, clearing user state');
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('[DIAGNOSTIC][AuthSession] Auth state changed with user, setting user state');
        setUser(session.user);
        
        // Don't fetch profile data here to avoid potential infinite loop
        // Only fetch when explicitly needed
      } else {
        console.log('[DIAGNOSTIC][AuthSession] No user in session after auth state change');
        setUser(null);
      }
      
      setLoading(false);
    });

    console.log('[DIAGNOSTIC][AuthSession] Auth state change listener setup complete');

    return () => {
      console.log('[DIAGNOSTIC][AuthSession] Unsubscribing from auth state change');
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  return {
    user,
    loading,
    sessionChecked
  };
}
