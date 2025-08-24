
import { Calendar, Users, Clock, DollarSign } from "lucide-react";
import { StatsCard } from "./StatsCard";

/**
 * Props interface for StatsOverview component
 */
interface StatsOverviewProps {
  stats: {
    completedJobsToday?: number;    // Number of pickups completed today
    pendingJobs?: number;   // Number of pickups not yet completed
    todayRevenue?: number;     // Revenue generated today
    totalCustomers?: number;   // Total number of customers
  };
  activeEmployeesCount: number; // Number of employees currently active/online
}

/**
 * StatsOverview - Displays key metrics in a grid of stats cards
 * 
 * Shows important business metrics like daily pickups, active employees,
 * pending pickups, and today's revenue in a responsive grid layout.
 */
export function StatsOverview({ stats, activeEmployeesCount }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Completed Jobs Today stat */}
      <StatsCard
        icon={Calendar}
        label="Completed Today"
        value={stats?.completedJobsToday || 0}
      />
      {/* Active Employees stat */}
      <StatsCard
        icon={Users}
        label="Active Employees"
        value={activeEmployeesCount}
      />
      {/* Pending Jobs stat */}
      <StatsCard
        icon={Clock}
        label="Pending Jobs"
        value={stats?.pendingJobs || 0}
      />
      {/* Today's Revenue stat */}
      <StatsCard
        icon={DollarSign}
        label="Today's Revenue"
        value={`$${stats?.todayRevenue?.toFixed(2) || '0.00'}`}
      />
    </div>
  );
}
