
import { ReactNode } from "react";
import { AdminDashboardContext } from "./contexts/AdminDashboardContext";
import { AdminDashboardProviderProps } from "./types/dashboardTypes";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useEmployeeLocations } from "./hooks/useEmployeeLocations";
import { useDashboardData } from "./hooks/useDashboardData";

/**
 * Dashboard Provider Component
 * Fetches data from Supabase and provides it via context to all dashboard components
 */
export function AdminDashboardProvider({ children }: AdminDashboardProviderProps) {
  // Use the custom hooks to get all necessary data
  const currentLocation = useCurrentLocation();
  const { employeeLocations, activeEmployees } = useEmployeeLocations();
  const { stats, houses, assignments, mockRevenueData, mockPickups } = useDashboardData();

  /**
   * Combine all data sources into a single context value
   */
  const dashboardData = {
    stats,
    houses,
    assignments,
    currentLocation,
    employeeLocations,
    activeEmployees,
    mockRevenueData,
    mockPickups
  };

  // Provide the context value to children
  return (
    <AdminDashboardContext.Provider value={dashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

// Re-export the hook for easier imports
export { useAdminDashboard } from "./hooks/useAdminDashboard";
