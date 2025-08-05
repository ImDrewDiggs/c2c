
import { useAuth } from "@/contexts/AuthContext";
import { AdminAccessCheck } from "@/components/admin/dashboard/AdminAccessCheck";
import { SimpleDashboardProvider } from "@/components/admin/dashboard/SimpleDashboardProvider";
import { AdminDashboardContent } from "@/components/admin/dashboard/AdminDashboardContent";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/Loading";

/**
 * Error fallback component for the dashboard
 * Displays when an error occurs in the dashboard and provides a way to recover
 */
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  
  const handleRetry = () => {
    // Force cache clear and reload
    console.error('[AdminDashboard] Error boundary triggered:', error);
    
    // Clear any cached modules and force reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Clear local storage cache if any
    try {
      localStorage.removeItem('dashboard-cache');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    
    // Reset error boundary first, then reload if that fails
    resetErrorBoundary();
    
    // Small delay then hard reload if error persists
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-destructive/10 p-6 rounded-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-destructive">
          Dashboard Loading Error
        </h2>
        <p className="mb-4 text-muted-foreground">
          There was an error loading the admin dashboard. This might be due to cached modules.
        </p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
          <pre className="bg-background p-4 rounded-md mt-2 overflow-auto max-h-40 text-xs">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="default">
            Clear Cache & Retry
          </Button>
          <Button onClick={() => window.location.href = '/admin/login'} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * AdminDashboard - The main Admin Dashboard page component
 * 
 * Wraps the dashboard content with authentication checks,
 * error boundaries, and the data provider context.
 */
export default function AdminDashboard() {
  console.log('[AdminDashboard] Loading with simple provider');
  
  return (
    <AdminAccessCheck>
      <SimpleDashboardProvider>
        <AdminDashboardContent />
      </SimpleDashboardProvider>
    </AdminAccessCheck>
  );
}
