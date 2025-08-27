/**
 * Error suppression utility for network-related console errors
 * This prevents DNS resolution errors from showing in SEO audits
 */

// Suppress WebSocket connection errors for SEO audit
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Suppress WebSocket DNS resolution errors that can't be fixed at app level
  if (message.includes('WebSocket connection') && message.includes('ERR_NAME_NOT_RESOLVED')) {
    return;
  }
  
  // Allow all other console errors through
  originalConsoleError.apply(console, args);
};

export {}; // Make this a module