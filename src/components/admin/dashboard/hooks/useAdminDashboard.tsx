
import { useContext } from "react";
import { AdminDashboardContext } from "../contexts/AdminDashboardContext";

/**
 * Hook to use the dashboard context
 * Throws an error if used outside of AdminDashboardProvider
 */
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  return context;
}
