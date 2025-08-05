import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simple dashboard data interface
interface DashboardData {
  stats: {
    totalUsers: number;
    newSignups: number;
    activeEmployees: number;
    completedJobs: number;
    pendingJobs: number;
  };
  serviceAreas: any[];
  employeeLocations: any[];
  scheduledJobs: any[];
  activityLogs: any[];
  currentLocation: any;
  loading: boolean;
  error: string | null;
}

// Create context with a default value
const SimpleDashboardContext = createContext<DashboardData>({
  stats: {
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0,
  },
  serviceAreas: [],
  employeeLocations: [],
  scheduledJobs: [],
  activityLogs: [],
  currentLocation: null,
  loading: false,
  error: null,
});

// Simple provider component
export function SimpleDashboardProvider({ children }: { children: ReactNode }) {
  const [loading] = useState(false);
  
  const dashboardData: DashboardData = {
    stats: {
      totalUsers: 15,
      newSignups: 3,
      activeEmployees: 8,
      completedJobs: 42,
      pendingJobs: 12,
    },
    serviceAreas: [],
    employeeLocations: [],
    scheduledJobs: [],
    activityLogs: [],
    currentLocation: null,
    loading,
    error: null,
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