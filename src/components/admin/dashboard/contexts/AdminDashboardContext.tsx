
import { createContext } from "react";
import { AdminDashboardContextValue } from "../types/dashboardTypes";

/**
 * Create context with a proper initial value to avoid undefined checks
 * This provides a default state for the context before data is loaded
 */
export const AdminDashboardContext = createContext<AdminDashboardContextValue>({
  stats: {
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0
  },
  serviceAreas: [],
  scheduledJobs: [],
  currentLocation: null,
  employeeLocations: [],
  activityLogs: [],
  loading: true,
  error: null
});
