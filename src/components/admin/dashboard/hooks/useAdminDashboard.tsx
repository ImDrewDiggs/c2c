
import { useContext } from "react";
import { AdminDashboardContext } from "../contexts/AdminDashboardContext";

// Hook to access the dashboard context
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  
  if (!context) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  
  return context;
}
