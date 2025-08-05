import { createContext } from "react";
import { AdminDashboardContextValue } from "../types/dashboardTypes";

// Create context with an initial undefined value
export const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(undefined);