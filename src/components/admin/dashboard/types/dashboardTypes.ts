
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";

/**
 * Type definition for the statistics data in the dashboard
 */
export interface DashboardStats {
  dailyPickups: number;
  weeklyPickups: number;
  monthlyPickups: number;
  activeEmployees: number;
  pendingPickups: number;
  completedPickups: number;
  todayRevenue: number;
}

/**
 * Mock pickup data type used in the dashboard
 */
export interface MockPickup {
  id: number;
  address: string;
  status: string;
  scheduledTime: string;
  assignedTo: string;
}

/**
 * Mock revenue data point type used in charts
 */
export interface RevenueDataPoint {
  name: string;
  amount: number;
}

/**
 * Type definition for the admin dashboard context value
 * Contains all data needed for the admin dashboard components
 */
export interface AdminDashboardContextValue {
  stats: DashboardStats;
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
  employeeLocations: EmployeeLocation[];
  activeEmployees: number;
  mockRevenueData: RevenueDataPoint[];
  mockPickups: MockPickup[];
}

/**
 * Props for the provider component
 */
export interface AdminDashboardProviderProps {
  children: React.ReactNode;
}
