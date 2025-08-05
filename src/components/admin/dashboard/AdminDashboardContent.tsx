import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";
import { StatsOverview } from "./StatsOverview";
import { ServiceAreasPanel } from "./ServiceAreasPanel";
import { EmployeeStatusPanel } from "./EmployeeStatusPanel";
import { ScheduledJobsPanel } from "./ScheduledJobsPanel";
import { ActivityLogsPanel } from "./ActivityLogsPanel";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { LiveGpsMap } from "./LiveGpsMap";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

// Remove the render2 function - it's not needed

export function AdminDashboardContent() {
  const { user, userData, isSuperAdmin } = useAuth();
  console.log('[AdminDashboardContent] Auth state:', { user: !!user, userData, isSuperAdmin });
  
  const { stats, serviceAreas, employeeLocations, scheduledJobs, activityLogs, currentLocation, loading, error } = useAdminDashboard();
  console.log('[AdminDashboardContent] Dashboard data:', { stats, loading, error });
  
  const handleRefresh = () => {
    console.log('[AdminDashboardContent] Refresh triggered');
    window.location.reload();
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
      <StatsOverview stats={stats} />
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
      
      {/* Full-width map section */}
      <LiveGpsMap 
        employeeLocations={employeeLocations} 
        serviceAreas={serviceAreas}
        currentLocation={currentLocation}
      />
    </div>
  );
}
