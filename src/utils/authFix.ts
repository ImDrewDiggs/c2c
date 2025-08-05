/**
 * Authentication fix utility
 * Clears corrupted authentication state and resets the connection
 */

export function clearAuthState() {
  try {
    // Clear all auth-related localStorage items
    localStorage.removeItem('can2curb-auth-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any other potential auth keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[AuthFix] Cleared corrupted authentication state');
    return true;
  } catch (error) {
    console.error('[AuthFix] Error clearing auth state:', error);
    return false;
  }
}

export function initializeAuthFix() {
  // Only run once on app initialization
  if (!localStorage.getItem('auth-fix-applied')) {
    clearAuthState();
    localStorage.setItem('auth-fix-applied', 'true');
    console.log('[AuthFix] Applied authentication fix');
  }
}