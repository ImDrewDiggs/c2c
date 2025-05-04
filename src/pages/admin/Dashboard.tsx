
import { useAuth } from "@/contexts/AuthContext";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { UserManagement } from "@/components/admin/UserManagement";
import { QuickLinks } from "@/components/admin/QuickLinks";
import { AdminAccessCheck } from "@/components/admin/dashboard/AdminAccessCheck";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/admin/dashboard/DashboardTabs";
import { OperationsContent } from "@/components/admin/dashboard/OperationsContent";
import { AdminDashboardProvider, useAdminDashboard } from "@/components/admin/dashboard/AdminDashboardProvider";
import { AuthService } from "@/services/AuthService";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
 * AdminDashboardContent - Content component for the admin dashboard
 * 
 * Consumes the dashboard context and renders the dashboard UI elements.
 * This component is wrapped by the AdminDashboardProvider for data access.
 */
function AdminDashboardContent() {
  const { user, userData, isSuperAdmin } = useAuth();
  const dashboardData = useAdminDashboard();
  
  // Show loading state if dashboard data isn't available yet
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center p-8 h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground ml-2">Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard header with title and actions */}
      <DashboardHeader isSuperAdmin={isSuperAdmin} />

      {/* Key metrics overview */}
      <StatsOverview 
        stats={{
          dailyPickups: dashboardData.stats.dailyPickups,
          pendingPickups: dashboardData.stats.pendingPickups,
          todayRevenue: dashboardData.stats.todayRevenue,
        }}
        activeEmployeesCount={dashboardData.activeEmployees}
      />

      {/* Quick access links for common actions */}
      <QuickLinks />

      {/* Tab navigation for different dashboard sections */}
      <DashboardTabs
        operationsContent={
          <OperationsContent
            houses={dashboardData.houses}
            assignments={dashboardData.assignments}
            currentLocation={dashboardData.currentLocation}
            employeeLocations={dashboardData.employeeLocations}
            revenueData={dashboardData.mockRevenueData}
            pickups={dashboardData.mockPickups}
          />
        }
        employeesContent={
          <EmployeeTracker 
            employeeLocations={dashboardData.employeeLocations} 
            currentLocation={dashboardData.currentLocation}
          />
        }
        analyticsContent={<AnalyticsDashboard />}
        usersContent={<UserManagement />}
      />
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
