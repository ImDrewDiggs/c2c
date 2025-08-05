
import { useContext } from "react";
import { AdminDashboardContext } from "../contexts/AdminDashboardContext";

/**
 * Hook to access the admin dashboard context
 * This is the single source of truth for consuming AdminDashboardContext
 */
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  
  if (context === undefined) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  
  return context;
}
