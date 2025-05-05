
import { createContext } from "react";
import { AdminDashboardContextValue } from "../types/dashboardTypes";

/**
 * Create context with a proper initial value to avoid undefined checks
 * This provides a default state for the context before data is loaded
 */
export const AdminDashboardContext = createContext<AdminDashboardContextValue>({
  stats: {
    dailyPickups: 0,
    weeklyPickups: 0,
    monthlyPickups: 0,
    activeEmployees: 0,
    pendingPickups: 0,
    completedPickups: 0,
    todayRevenue: 0,
  },
  houses: [],
  assignments: [],
  currentLocation: null,
  employeeLocations: [],
  activeEmployees: 0,
  mockRevenueData: [],
  mockPickups: [],
});
