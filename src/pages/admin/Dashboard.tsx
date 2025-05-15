
import { useAuth } from "@/contexts/AuthContext";
import { AdminAccessCheck } from "@/components/admin/dashboard/AdminAccessCheck";
import { AdminDashboardProvider } from "@/components/admin/dashboard/AdminDashboardProvider";
import { AdminDashboardContent } from "@/components/admin/dashboard/AdminDashboardContent";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/Loading";

/**
 * Error fallback component for the dashboard
 * Displays when an error occurs in the dashboard and provides a way to recover
 */
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 bg-destructive/10 rounded-md">
      <h2 className="text-xl font-semibold mb-4">Something went wrong loading the dashboard</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <pre className="bg-background p-4 rounded-md mb-4 overflow-auto max-h-40 text-xs">
        {error.stack}
      </pre>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
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
  return (
    <AdminAccessCheck>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
        onError={(error) => console.error("Dashboard Error:", error)}
      >
        <AdminDashboardProvider>
          <AdminDashboardContent />
        </AdminDashboardProvider>
      </ErrorBoundary>
    </AdminAccessCheck>
  );
}
