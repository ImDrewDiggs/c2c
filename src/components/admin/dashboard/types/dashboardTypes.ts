
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";

/**
 * Type definition for the statistics data in the dashboard
 */
export interface DashboardStats {
  totalUsers: number;
  newSignups: number;
  activeEmployees: number;
  completedJobs: number;
  pendingJobs: number;
}

/**
 * Activity log item type
 */
export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

/**
 * Scheduled job type
 */
export interface ScheduledJob extends Assignment {
  house?: House;
  employee_name?: string;
  due_date?: string;
}

/**
 * Type definition for the admin dashboard context value
 */
export interface AdminDashboardContextValue {
  stats: DashboardStats;
  serviceAreas: House[];
  scheduledJobs: ScheduledJob[];
  currentLocation: Location | null;
  employeeLocations: EmployeeLocation[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

/**
 * Props for the provider component
 */
export interface AdminDashboardProviderProps {
  children: React.ReactNode;
}
