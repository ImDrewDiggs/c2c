
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

// Wrapper component that consumes the dashboard context
function AdminDashboardContent() {
  const { user, userData, isSuperAdmin } = useAuth();
  const dashboardData = useAdminDashboard();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader isSuperAdmin={isSuperAdmin} />

      <StatsOverview 
        stats={{
          dailyPickups: dashboardData.stats.dailyPickups,
          pendingPickups: dashboardData.stats.pendingPickups,
          todayRevenue: dashboardData.stats.todayRevenue,
        }}
        activeEmployeesCount={dashboardData.activeEmployees}
      />

      <QuickLinks />

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

export default function AdminDashboard() {
  // Hard-coded admin email for verification
  const ADMIN_EMAIL = 'diggs844037@yahoo.com';

  return (
    <AdminAccessCheck adminEmail={ADMIN_EMAIL}>
      <AdminDashboardProvider>
        <AdminDashboardContent />
      </AdminDashboardProvider>
    </AdminAccessCheck>
  );
}
