
import { createContext, useContext } from "react";
import { AdminDashboardContextValue } from "../types/dashboardTypes";
import { render2 } from "../AdminDashboardContent";

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

// Provider component that uses the render2 function correctly
export const AdminDashboardProvider = ({ children, value }: { 
  children: React.ReactNode;
  value: AdminDashboardContextValue;
}) => {
  // Use render2 correctly with a valid React element
  return render2(
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};
