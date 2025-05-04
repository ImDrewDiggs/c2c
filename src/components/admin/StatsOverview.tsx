
import { Calendar, Users, Clock, DollarSign } from "lucide-react";
import { StatsCard } from "./StatsCard";

/**
 * Props interface for StatsOverview component
 */
interface StatsOverviewProps {
  stats: {
    dailyPickups: number;    // Number of pickups scheduled for today
    pendingPickups: number;   // Number of pickups not yet completed
    todayRevenue: number;     // Revenue generated today
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
      {/* Daily Pickups stat */}
      <StatsCard
        icon={Calendar}
        label="Today's Pickups"
        value={stats?.dailyPickups}
      />
      {/* Active Employees stat */}
      <StatsCard
        icon={Users}
        label="Active Employees"
        value={activeEmployeesCount}
      />
      {/* Pending Pickups stat */}
      <StatsCard
        icon={Clock}
        label="Pending Pickups"
        value={stats?.pendingPickups}
      />
      {/* Today's Revenue stat */}
      <StatsCard
        icon={DollarSign}
        label="Today's Revenue"
        value={`$${stats?.todayRevenue}`}
      />
    </div>
  );
}
