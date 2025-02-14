
import { Calendar, Users, Clock, DollarSign } from "lucide-react";
import { StatsCard } from "./StatsCard";

interface StatsOverviewProps {
  stats: {
    dailyPickups: number;
    pendingPickups: number;
    todayRevenue: number;
  };
  activeEmployeesCount: number;
}

export function StatsOverview({ stats, activeEmployeesCount }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={Calendar}
        label="Today's Pickups"
        value={stats?.dailyPickups}
      />
      <StatsCard
        icon={Users}
        label="Active Employees"
        value={activeEmployeesCount}
      />
      <StatsCard
        icon={Clock}
        label="Pending Pickups"
        value={stats?.pendingPickups}
      />
      <StatsCard
        icon={DollarSign}
        label="Today's Revenue"
        value={`$${stats?.todayRevenue}`}
      />
    </div>
  );
}
