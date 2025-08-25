import { useSimpleDashboard } from "./SimpleDashboardProvider";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";
import { StatsOverview } from "../StatsOverview";
import { ServiceAreasPanel } from "./ServiceAreasPanel";
import { EmployeeStatusPanel } from "./EmployeeStatusPanel";
import { ScheduledJobsPanel } from "./ScheduledJobsPanel";
import { ActivityLogsPanel } from "./ActivityLogsPanel";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { MaintenanceSchedulePanel } from "./MaintenanceSchedulePanel";
import { LiveGpsMap } from "./LiveGpsMap";
import { DashboardTabs } from "./DashboardTabs";
import { RealAnalyticsDashboard } from "../analytics/RealAnalyticsDashboard";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserManagement } from "../UserManagement";
import { ExpandableGroups } from "./ExpandableGroups";
import { ComprehensiveDocumentation } from "../documentation/ComprehensiveDocumentation";
import React from "react";

export function AdminDashboardContent() {
  const { user, userData, isSuperAdmin } = useAuth();
  
  console.log('[AdminDashboardContent] Component rendering with auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isSuperAdmin
  });
  
  const { stats, serviceAreas, employeeLocations, scheduledJobs, activityLogs, currentLocation, maintenanceSchedules, loading, error, refresh } = useSimpleDashboard();
  
  console.log('[AdminDashboardContent] Dashboard state:', {
    loading,
    error,
    hasStats: !!stats,
    statsContent: stats
  });
  
  const handleRefresh = () => {
    if (refresh) {
      refresh();
    } else {
      window.location.reload();
    }
  };

  // Transform stats to match StatsOverview interface
  const transformedStats = {
    dailyPickups: stats.completedJobs + stats.pendingJobs,
    pendingPickups: stats.pendingJobs,
    todayRevenue: 5400 // Mock today's revenue
  };

  if (loading) {
    return (
      <Loading 
        fullscreen={true}
        size="medium"
        message="Loading dashboard data..."
      />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="font-semibold text-destructive mb-2">Error loading dashboard</h2>
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard header with title and actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {userData?.full_name || user?.email?.split('@')[0] || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <LogoutButton />
        </div>
      </div>

      {/* Key metrics overview */}
      <StatsOverview stats={transformedStats} activeEmployeesCount={employeeLocations.filter(emp => emp.is_online).length} />

      {/* Quick access navigation groups */}
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <ExpandableGroups />
      </div>
      
      {/* Dashboard with tabs */}
      <DashboardTabs
        operationsContent={
          <>
            {/* Main dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* First column */}
              <div className="space-y-6">
                <ServiceAreasPanel serviceAreas={serviceAreas} />
                <QuickActionsPanel />
              </div>
              
              {/* Second column */}
              <div className="space-y-6">
                <EmployeeStatusPanel employees={employeeLocations} />
                <ActivityLogsPanel logs={activityLogs} />
              </div>
              
              {/* Third column */}
              <div className="space-y-6">
                <ScheduledJobsPanel jobs={scheduledJobs} />
              </div>
              
              {/* Fourth column */}
              <div className="space-y-6">
                <MaintenanceSchedulePanel schedules={maintenanceSchedules} />
              </div>
            </div>
            
            {/* Full-width map section */}
            <LiveGpsMap 
              employeeLocations={employeeLocations} 
              serviceAreas={serviceAreas}
              currentLocation={currentLocation}
            />
          </>
        }
        employeesContent={
          <div className="space-y-6">
            <EmployeeStatusPanel employees={employeeLocations} />
            <ActivityLogsPanel logs={activityLogs} />
            <LiveGpsMap 
              employeeLocations={employeeLocations} 
              serviceAreas={serviceAreas}
              currentLocation={currentLocation}
            />
          </div>
        }
        analyticsContent={
          <RealAnalyticsDashboard />
        }
        usersContent={
          <UserManagement />
        }
        documentationContent={
          <ComprehensiveDocumentation />
        }
      />
    </div>
  );
}