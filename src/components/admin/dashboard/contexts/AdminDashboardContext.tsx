import { createContext, useContext } from "react";
import { AdminDashboardContextValue } from "../types/dashboardTypes";

// Create context with an initial undefined value
export const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(undefined);

// Create hook for using the context
export function useAdminDashboardContext() {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboardContext must be used within an AdminDashboardProvider");
  }
  return context;
}