import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useEmployeeLocations } from "./hooks/useEmployeeLocations";
import { useRealTimeStats } from "@/hooks/admin/useRealTimeStats";

// Real dashboard data interface
interface DashboardData {
  stats: {
    totalUsers: number;
    newSignups: number;
    activeEmployees: number;
    completedJobs: number;
    pendingJobs: number;
    todayRevenue: number;
    totalCustomers: number;
    totalEmployees: number;
    totalVehicles: number;
    activeSubscriptions: number;
  };
  serviceAreas?: any[];
  scheduledJobs?: any[];
  activityLogs?: any[];
  maintenanceSchedules?: any[];
  employeeLocations: any[];
  currentLocation: any;
  loading: boolean;
  error: string | null;
  refresh?: () => void;
}

// Create context with a default value
const SimpleDashboardContext = createContext<DashboardData>({
  stats: {
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalVehicles: 0,
    activeSubscriptions: 0,
  },
  employeeLocations: [],
  currentLocation: null,
  loading: false,
  error: null,
  refresh: undefined,
});

// Real provider component with database integration
export function SimpleDashboardProvider({ children }: { children: ReactNode }) {
  const currentLocation = useCurrentLocation();
  const { employeeLocations } = useEmployeeLocations();
  const { data: realTimeStats, isLoading, error, refetch } = useRealTimeStats();

  const dashboardData: DashboardData = {
    stats: realTimeStats || {
      totalUsers: 0,
      newSignups: 0,
      activeEmployees: 0,
      completedJobs: 0,
      pendingJobs: 0,
      todayRevenue: 0,
      totalCustomers: 0,
      totalEmployees: 0,
      totalVehicles: 0,
      activeSubscriptions: 0,
    },
    employeeLocations,
    currentLocation,
    loading: isLoading,
    error: error?.message || null,
    refresh: refetch,
  };

  return (
    <SimpleDashboardContext.Provider value={dashboardData}>
      {children}
    </SimpleDashboardContext.Provider>
  );
}

// Simple hook to use dashboard data
export function useSimpleDashboard() {
  return useContext(SimpleDashboardContext);
}