/**
 * Utility functions for handling cache issues in the admin dashboard
 */

export const clearApplicationCache = async (): Promise<void> => {
  try {
    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }

    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear browser cache if supported
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    console.log('[CacheUtils] Application cache cleared successfully');
  } catch (error) {
    console.warn('[CacheUtils] Could not clear all caches:', error);
  }
};

export const forceModuleRefresh = (): void => {
  // Add timestamp to force module refresh
  const timestamp = Date.now();
  const url = new URL(window.location.href);
  url.searchParams.set('refresh', timestamp.toString());
  
  // Replace current history state
  window.history.replaceState({}, '', url.toString());
  
  // Force hard reload
  window.location.reload();
};

export const isDashboardCacheStale = (): boolean => {
  const lastUpdate = localStorage.getItem('dashboard-last-update');
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  if (!lastUpdate) {
    localStorage.setItem('dashboard-last-update', currentTime.toString());
    return false;
  }
  
  return (currentTime - parseInt(lastUpdate)) > oneHour;
};

export const updateDashboardCache = (): void => {
  localStorage.setItem('dashboard-last-update', Date.now().toString());
};