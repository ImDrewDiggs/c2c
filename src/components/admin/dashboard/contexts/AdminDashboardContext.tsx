
import { createContext, useContext } from "react";
import { AdminDashboardData } from "../types/dashboardTypes";
import { render2 } from "../AdminDashboardContent";

// Create context with an initial undefined value
export const AdminDashboardContext = createContext<AdminDashboardData | undefined>(undefined);

// Create hook for using the context
export function useAdminDashboardContext() {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboardContext must be used within an AdminDashboardProvider");
  }
  return context;
}

// Ensure the provider component uses render2 function
export const AdminDashboardProvider = ({ children, value }: { 
  children: React.ReactNode;
  value: AdminDashboardData;
}) => {
  return render2(
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};
