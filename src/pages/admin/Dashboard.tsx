
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

// Wrapper component that consumes the dashboard context
function AdminDashboardContent() {
  const { user, userData, isSuperAdmin } = useAuth();
  const dashboardData = useAdminDashboard();
  
  // Ensure we have valid data before passing to components
  const safeEmployeeLocations = Array.isArray(dashboardData?.employeeLocations) 
    ? dashboardData.employeeLocations 
    : [];
  
  console.log("AdminDashboardContent rendering with dashboard data:", safeEmployeeLocations.length, "employees");
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader isSuperAdmin={isSuperAdmin} />

      <StatsOverview 
        stats={{
          dailyPickups: dashboardData?.stats?.dailyPickups ?? 0,
          pendingPickups: dashboardData?.stats?.pendingPickups ?? 0,
          todayRevenue: dashboardData?.stats?.todayRevenue ?? 0,
        }}
        activeEmployeesCount={dashboardData?.activeEmployees ?? 0}
      />

      <QuickLinks />

      <DashboardTabs
        operationsContent={
          <OperationsContent
            houses={dashboardData?.houses ?? []}
            assignments={dashboardData?.assignments ?? []}
            currentLocation={dashboardData?.currentLocation ?? null}
            employeeLocations={safeEmployeeLocations}
            revenueData={dashboardData?.mockRevenueData ?? []}
            pickups={dashboardData?.mockPickups ?? []}
          />
        }
        employeesContent={
          <EmployeeTracker 
            employeeLocations={safeEmployeeLocations} 
            currentLocation={dashboardData?.currentLocation ?? null}
          />
        }
        analyticsContent={<AnalyticsDashboard />}
        usersContent={<UserManagement />}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAccessCheck>
      <AdminDashboardProvider>
        <AdminDashboardContent />
      </AdminDashboardProvider>
    </AdminAccessCheck>
  );
}
